import { Image, ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNotesStore } from '../../../store/notesStore';
import { deleteNote as deleteNoteApi } from '../../../lib/api';
import * as Haptics from 'expo-haptics';

export default function NotaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { notes, archiveNote, deleteNote } = useNotesStore();
  const note = notes.find((n) => n.id === id);

  if (!note) {
    return (
      <View style={styles.container}>
        <Text>Nota no encontrada</Text>
        <Button onPress={() => router.back()}>Volver</Button>
      </View>
    );
  }

  const handleArchive = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Archivar nota', '¿Estás seguro de que quieres archivar esta nota?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Archivar',
        onPress: async () => {
          await archiveNote(id!);
          router.back();
        },
      },
    ]);
  };

  const handleDeleteConfirmed = async () => {
    try {
      await deleteNoteApi(id!);
      deleteNote(id!);
      router.back();
    } catch (error) {
      if (error instanceof Error && error.message === 'Nota no encontrada') {
        deleteNote(id!);
        router.back();
        return;
      }
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'No se pudo eliminar la nota'
      );
    }
  };

  const handleDelete = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Eliminar nota',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: handleDeleteConfirmed,
        },
      ]
    );
  };

  const imageUrls = Array.from(
    note.content.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g),
    (match) => match[1]
  );
  const textWithoutImages = note.content.replace(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g, '').trim();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={note.title} />
        <Card.Content>
          {imageUrls.length > 0 && (
            <View style={styles.imagesContainer}>
              {imageUrls.map((url) => (
                <Image key={url} source={{ uri: url }} style={styles.noteImage} />
              ))}
            </View>
          )}
          {textWithoutImages ? (
            <Text variant="bodyLarge" style={styles.content}>
              {textWithoutImages}
            </Text>
          ) : null}
          <Text style={styles.date}>
            {new Date(note.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </Card.Content>
      </Card>
      <View style={styles.buttonGroup}>
        <Button mode="contained" onPress={() => router.back()} style={styles.button}>
          Volver
        </Button>
        <Button mode="outlined" onPress={handleArchive} style={styles.button}>
          Archivar
        </Button>
        <Button
          mode="outlined"
          textColor="#D64545"
          onPress={handleDelete}
          style={styles.button}
        >
          Eliminar
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginBottom: 20,
  },
  content: {
    marginBottom: 16,
    lineHeight: 24,
  },
  date: {
    color: '#7A78A4',
    marginTop: 16,
  },
  buttonGroup: {
    gap: 12,
  },
  button: {
    marginTop: 8,
  },
});
