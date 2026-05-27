import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNotesStore } from '../../../store/notesStore';
import * as Haptics from 'expo-haptics';

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { ideas, archiveIdea, deleteIdea } = useNotesStore();
  const idea = ideas.find((i) => i.id === id);

  if (!idea) {
    return (
      <View style={styles.container}>
        <Text>Idea no encontrada</Text>
        <Button onPress={() => router.back()}>Volver</Button>
      </View>
    );
  }

  const handleArchive = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Archivar idea', '¿Estás seguro de que quieres archivar esta idea?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Archivar',
        onPress: () => {
          archiveIdea(id!);
          router.back();
        },
      },
    ]);
  };

  const handleDelete = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Eliminar idea',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteIdea(id!);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={[styles.card, { backgroundColor: idea.color }]}>
        <Card.Title title={idea.title} titleStyle={styles.cardTitle} />
        <Card.Content>
          <View style={styles.tagsContainer}>
            {idea.tags.map((tag) => (
              <Chip key={tag} style={styles.tag}>
                {tag}
              </Chip>
            ))}
          </View>
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
  cardTitle: {
    color: '#1F1B33',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginBottom: 8,
  },
  buttonGroup: {
    gap: 12,
  },
  button: {
    marginTop: 8,
  },
});
