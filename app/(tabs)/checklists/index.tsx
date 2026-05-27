import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeOutLeft } from 'react-native-reanimated';
import { useState, useMemo } from 'react';
import ChecklistCard from '../../../components/items/ChecklistCard';
import EmptyState from '../../../components/EmptyState';
import { useNotesStore } from '../../../store/notesStore';

export default function ChecklistsScreen() {
  const router = useRouter();
  const { checklists } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChecklists = useMemo(() => {
    if (!searchQuery.trim()) return checklists;
    return checklists.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [checklists, searchQuery]);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Tareas
        </Text>
        <TextInput
          placeholder="Buscar tareas..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
        />
      </View>

      {filteredChecklists.length === 0 ? (
        <EmptyState
          icon="checkbox-marked-outline"
          title="Sin tareas"
          message={
            searchQuery
              ? `No se encontraron tareas con "${searchQuery}"`
              : 'Crea tu primera lista de tareas'
          }
        />
      ) : (
        <FlashList
          data={filteredChecklists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const completed = item.items.filter((i) => i.isCompleted).length;
            return (
              <Animated.View entering={FadeInDown} exiting={FadeOutLeft}>
                <ChecklistCard
                  title={item.title}
                  completed={completed}
                  total={item.items.length}
                  onPress={() => router.push(`/checklists/${item.id}`)}
                />
              </Animated.View>
            );
          }}
          contentContainerStyle={styles.list}
        />
      )}

      <View style={styles.buttonWrapper}>
        <Button
          mode="contained"
          onPress={() => router.push({ pathname: '/nueva-note', params: { type: 'checklist' } })}
        >
          Nueva tarea
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    marginBottom: 12,
  },
  searchInput: {
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  buttonWrapper: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E9E8F5',
  },
});
