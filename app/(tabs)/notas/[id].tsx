import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNotesStore } from '../../../store/notesStore';
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
        onPress: () => {
          archiveNote(id!);
          router.back();
        },
      },
    ]);
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
          onPress: () => {
            deleteNote(id!);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={note.title} />
        <Card.Content>
          <Text variant="bodyLarge" style={styles.content}>
            {note.content}
          </Text>
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
