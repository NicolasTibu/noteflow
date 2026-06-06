import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Card, Chip, HelperText, Switch, Text, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useGlobalSearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import type { ZodError } from 'zod';
import { noteSchema, checklistNoteSchema, ideaNoteSchema } from '../constants/validationSchemas';
import { useNotesStore } from '../store/notesStore';
import { uploadNoteImage } from '../lib/storage';
import type { ChecklistNote, IdeaNote } from '../types';

type NoteType = 'note' | 'checklist' | 'idea';

const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  note: 'Crear nueva nota',
  checklist: 'Crear nueva tarea',
  idea: 'Crear nueva idea',
};

function parseNoteType(value: string | string[] | undefined): NoteType {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'checklist' || raw === 'idea') return raw;
  return 'note';
}

function mapZodErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const key = issue.path[0]?.toString() ?? '_form';
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  });
  return fieldErrors;
}

export default function NuevaNoteModal() {
  const router = useRouter();
  const localParams = useLocalSearchParams<{ type?: string }>();
  const globalParams = useGlobalSearchParams<{ type?: string }>();
  const typeParam = localParams.type ?? globalParams.type;
  const [noteType, setNoteType] = useState<NoteType>(() => parseNoteType(typeParam));

  useEffect(() => {
    setNoteType(parseNoteType(typeParam));
  }, [typeParam]);

  const { addArchivedNote, addChecklist, addIdea, createNote } = useNotesStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [archiveOnSave, setArchiveOnSave] = useState(false);
  const [items, setItems] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [color, setColor] = useState('#F8EDEB');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null);
  const [isAttachingImage, setIsAttachingImage] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const colors = ['#F8EDEB', '#DDEBF7', '#E8F5E9', '#FFF3E0', '#FCE4EC'];

  const handleAddItem = () => {
    setItems([...items, '']);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleAttachImage = async () => {
    setAttachmentError(null);
    try {
      setIsAttachingImage(true);

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        setAttachmentError('Necesitamos permisos para acceder a tu galería');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (pickerResult.canceled) {
        return;
      }

      const uri = pickerResult.assets[0].uri;
      const publicUrl = await uploadNoteImage(uri);
      setAttachedImageUrl(publicUrl);

      const imageMarkdown = `\n\n![Imagen adjunta](${publicUrl})`;
      setContent((current) => `${current}${imageMarkdown}`);
    } catch (error) {
      setAttachmentError(error instanceof Error ? error.message : 'Error al adjuntar imagen');
    } finally {
      setIsAttachingImage(false);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const getTagsForSave = (): string[] => {
    const pending = tagInput.trim();
    if (pending && !tags.includes(pending)) {
      return [...tags, pending];
    }
    return tags;
  };

  const handleSave = async () => {
    setErrors({});

    if (noteType === 'note') {
      const result = noteSchema.safeParse({ title, content });
      if (!result.success) {
        setErrors(mapZodErrors(result.error));
        return;
      }

      try {
        await createNote({ title, type: 'note', content, color }, archiveOnSave);
      } catch (error) {
        setErrors({
          _form:
            error instanceof Error
              ? error.message
              : 'No se pudo guardar la nota en el servidor',
        });
        return;
      }

      router.back();
      return;
    }

    if (noteType === 'checklist') {
      const parsedItems = items
        .filter((text) => text.trim())
        .map((text, idx) => ({
          id: `${Date.now().toString()}-${idx}`,
          text: text.trim(),
          isCompleted: false,
        }));

      if (parsedItems.length === 0) {
        setErrors({ items: 'Añade al menos un item con texto' });
        return;
      }

      const result = checklistNoteSchema.safeParse({ title, items: parsedItems });
      if (!result.success) {
        setErrors(mapZodErrors(result.error));
        return;
      }

        try {
        const payload: any = { title, type: 'checklist', content: '' };
        if (color) payload.color = color;
        const created = await createNote(payload);
        addChecklist({
          ...(created as ChecklistNote),
          items: parsedItems,
        });
      } catch (error) {
        setErrors({
          _form:
            error instanceof Error
              ? error.message
              : 'No se pudo guardar la tarea en el servidor',
        });
        return;
      }

      router.back();
      return;
    }

    const tagsToSave = getTagsForSave();
    const result = ideaNoteSchema.safeParse({ title, tags: tagsToSave, color });
    if (!result.success) {
      setErrors(mapZodErrors(result.error));
      return;
    }

    try {
      const payload: any = { title, type: 'idea', content: '' };
      if (color) payload.color = color;
      const created = await createNote(payload);
      addIdea({
        ...(created as IdeaNote),
        tags: tagsToSave,
        color,
      });
    } catch (error) {
      setErrors({
        _form:
          error instanceof Error
            ? error.message
            : 'No se pudo guardar la idea en el servidor',
      });
      return;
    }

    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: 'height' })}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Title title={NOTE_TYPE_LABELS[noteType]} />
          <Card.Content>
            <TextInput
              label="Título"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              error={!!errors.title}
            />
            {errors.title && <HelperText type="error">{errors.title}</HelperText>}
            {errors._form && <HelperText type="error">{errors._form}</HelperText>}

            {noteType === 'note' && (
              <>
                <TextInput
                  label="Contenido"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  numberOfLines={4}
                  style={[styles.input, styles.textarea]}
                  error={!!errors.content}
                />
                {errors.content && <HelperText type="error">{errors.content}</HelperText>}

                <Button
                  mode="outlined"
                  onPress={handleAttachImage}
                  loading={isAttachingImage}
                  disabled={isAttachingImage}
                  style={styles.attachButton}
                >
                  Adjuntar a nota
                </Button>
                {attachmentError && <HelperText type="error">{attachmentError}</HelperText>}
                {attachedImageUrl ? (
                  <View style={styles.attachmentPreview}>
                    <Text style={styles.attachmentLabel}>Imagen adjunta</Text>
                    <Image source={{ uri: attachedImageUrl }} style={styles.attachmentImage} />
                  </View>
                ) : null}

                <View style={styles.archiveRow}>
                  <Text variant="bodyMedium">Guardar en archivadas</Text>
                  <Switch value={archiveOnSave} onValueChange={setArchiveOnSave} />
                </View>
              </>
            )}

            {noteType === 'checklist' && (
              <>
                <Text style={styles.subLabel}>Items (al menos uno)</Text>
                {items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <TextInput
                      placeholder={`Item ${index + 1}`}
                      value={item}
                      onChangeText={(value) => handleUpdateItem(index, value)}
                      style={styles.itemInput}
                    />
                    {items.length > 1 && (
                      <Button onPress={() => handleRemoveItem(index)} style={styles.removeButton}>
                        ✕
                      </Button>
                    )}
                  </View>
                ))}
                <Button mode="outlined" onPress={handleAddItem} style={styles.addButton}>
                  + Añadir item
                </Button>
                {errors.items && <HelperText type="error">{errors.items}</HelperText>}
              </>
            )}

            {noteType === 'idea' && (
              <>
                <TextInput
                  label="Etiqueta (opcional)"
                  value={tagInput}
                  onChangeText={setTagInput}
                  style={styles.input}
                  onSubmitEditing={handleAddTag}
                />
                <Button mode="outlined" onPress={handleAddTag} style={styles.addButton}>
                  + Añadir etiqueta
                </Button>
                <View style={styles.tagsContainer}>
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      onClose={() => handleRemoveTag(tag)}
                      style={styles.tagChip}
                    >
                      {tag}
                    </Chip>
                  ))}
                </View>
                {errors.tags && <HelperText type="error">{errors.tags}</HelperText>}

                <Text style={styles.subLabel}>Color</Text>
                <View style={styles.colorGrid}>
                  {colors.map((col) => (
                    <Pressable
                      key={col}
                      onPress={() => setColor(col)}
                      style={[
                        styles.colorButton,
                        {
                          backgroundColor: col,
                          borderWidth: color === col ? 3 : 0,
                          borderColor: '#5B56D6',
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Color ${col}`}
                    />
                  ))}
                </View>
              </>
            )}

            <Button mode="contained" onPress={handleSave} style={styles.button}>
              Guardar
            </Button>
            <Button mode="text" onPress={() => router.back()} style={styles.cancelButton}>
              Cancelar
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  scrollContent: {
    justifyContent: 'center',
    padding: 20,
    minHeight: '100%',
  },
  card: {
    padding: 16,
  },
  input: {
    marginBottom: 8,
  },
  textarea: {
    minHeight: 100,
  },
  archiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  subLabel: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  itemInput: {
    flex: 1,
  },
  removeButton: {
    padding: 0,
  },
  addButton: {
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  tagChip: {
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  attachButton: {
    marginTop: 8,
    marginBottom: 12,
  },
  attachmentPreview: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  attachmentLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  attachmentImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F4F4F4',
  },
  button: {
    marginTop: 8,
    marginBottom: 12,
  },
  cancelButton: {
    alignSelf: 'flex-start',
  },
});
