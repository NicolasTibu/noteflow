import { Alert, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, FadeOutLeft } from 'react-native-reanimated';
import { useState, useMemo } from 'react';
import NoteCard from '../../../components/items/NoteCard';
import EmptyState from '../../../components/EmptyState';
import { useNotesStore } from '../../../store/notesStore';
import type { AnyNote } from '../../../types';

export const options = {
  title: 'Archivadas',
  tabBarIcon: ({ color, size }: { color: string; size: number }) => (
    <MaterialCommunityIcons name="archive-outline" color={color} size={size ?? 24} />
  ),
};

function getArchivedExcerpt(item: AnyNote): string {
  if ('items' in item) return `${item.items.length} items`;
  if ('tags' in item) return item.tags.join(', ');
  return item.content;
}

export default function ArchivedScreen() {
  const {
    archivedNotes,
    archivedChecklists,
    archivedIdeas,
    unarchiveNote,
    unarchiveChecklist,
    unarchiveIdea,
    deleteArchivedNote,
    deleteArchivedChecklist,
    deleteArchivedIdea,
  } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArchived = useMemo(() => {
    const allArchived = [...archivedNotes, ...archivedChecklists, ...archivedIdeas];
    if (!searchQuery.trim()) return allArchived;
    const query = searchQuery.toLowerCase();
    return allArchived.filter((item) => item.title.toLowerCase().includes(query));
  }, [archivedNotes, archivedChecklists, archivedIdeas, searchQuery]);

  const handleUnarchive = (item: AnyNote) => {
    if ('content' in item) unarchiveNote(item.id);
    else if ('items' in item) unarchiveChecklist(item.id);
    else if ('tags' in item) unarchiveIdea(item.id);
  };

  const handleDeleteArchived = (item: AnyNote) => {
    if ('content' in item) deleteArchivedNote(item.id);
    else if ('items' in item) deleteArchivedChecklist(item.id);
    else if ('tags' in item) deleteArchivedIdea(item.id);
  };

  const handleArchivedPress = (item: AnyNote) => {
    Alert.alert(item.title, '¿Qué quieres hacer con este elemento?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Restaurar', onPress: () => handleUnarchive(item) },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Eliminar permanentemente',
            'Esta acción no se puede deshacer.',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Eliminar',
                style: 'destructive',
                onPress: () => handleDeleteArchived(item),
              },
            ]
          );
        },
      },
    ]);
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Archivadas
        </Text>
        <TextInput
          placeholder="Buscar archivadas..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
        />
      </View>

      {filteredArchived.length === 0 ? (
        <EmptyState
          icon="archive-outline"
          title="Sin archivadas"
          message={
            searchQuery
              ? `No se encontraron items con "${searchQuery}"`
              : 'Aquí aparecerán tus notas archivadas'
          }
        />
      ) : (
        <FlashList
          data={filteredArchived}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Animated.View entering={FadeInDown} exiting={FadeOutLeft}>
              <NoteCard
                title={item.title}
                excerpt={getArchivedExcerpt(item)}
                date={new Date(item.createdAt).toLocaleDateString('es-ES')}
                onPress={() => handleArchivedPress(item)}
              />
            </Animated.View>
          )}
          contentContainerStyle={styles.list}
          style={styles.listContainer}
        />
      )}
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
  listContainer: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
