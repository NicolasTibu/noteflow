import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Button, Card, Checkbox, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNotesStore } from '../../../store/notesStore';
import * as Haptics from 'expo-haptics';

export default function ChecklistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { checklists, toggleChecklistItem, archiveChecklist, deleteChecklist } =
    useNotesStore();
  const checklist = checklists.find((c) => c.id === id);

  if (!checklist) {
    return (
      <View style={styles.container}>
        <Text>Lista no encontrada</Text>
        <Button onPress={() => router.back()}>Volver</Button>
      </View>
    );
  }

  const completed = checklist.items.filter((i) => i.isCompleted).length;
  const isAllCompleted = completed === checklist.items.length && checklist.items.length > 0;

  const handleToggleItem = async (itemId: string) => {
    toggleChecklistItem(id!, itemId);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newCompleted = checklist.items.filter(
      (i) => i.id === itemId ? !i.isCompleted : i.isCompleted
    ).length;
    if (newCompleted === checklist.items.length) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleArchive = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Archivar lista', '¿Estás seguro de que quieres archivar esta lista?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Archivar',
        onPress: () => {
          archiveChecklist(id!);
          router.back();
        },
      },
    ]);
  };

  const handleDelete = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Eliminar tarea',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteChecklist(id!);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title={checklist.title}
          subtitle={`${completed}/${checklist.items.length} completadas`}
        />
        <Card.Content>
          {checklist.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Checkbox
                status={item.isCompleted ? 'checked' : 'unchecked'}
                onPress={() => handleToggleItem(item.id)}
              />
              <Text
                style={[
                  styles.itemText,
                  item.isCompleted && styles.itemTextCompleted,
                ]}
              >
                {item.text}
              </Text>
            </View>
          ))}
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemText: {
    marginLeft: 12,
    flex: 1,
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#7A78A4',
  },
  buttonGroup: {
    gap: 12,
  },
  button: {
    marginTop: 8,
  },
});
