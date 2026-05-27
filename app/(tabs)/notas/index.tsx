import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeOutLeft } from 'react-native-reanimated';
import { useState, useMemo } from 'react';
import NoteCard from '../../../components/items/NoteCard';
import EmptyState from '../../../components/EmptyState';
import { useNotesStore } from '../../../store/notesStore';

export default function NotasScreen() {
  const router = useRouter();
  const { notes } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery]);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Notas
        </Text>
        <TextInput
          placeholder="Buscar notas..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
        />
      </View>

      {filteredNotes.length === 0 ? (
        <EmptyState
          icon="note-outline"
          title="Sin notas"
          message={
            searchQuery
              ? `No se encontraron notas con "${searchQuery}"`
              : 'Comienza creando tu primera nota'
          }
        />
      ) : (
        <FlashList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Animated.View entering={FadeInDown} exiting={FadeOutLeft}>
              <NoteCard
                title={item.title}
                excerpt={item.content}
                date={new Date(item.createdAt).toLocaleDateString('es-ES')}
                onPress={() => router.push(`/notas/${item.id}`)}
              />
            </Animated.View>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <View style={styles.buttonWrapper}>
        <Button
          mode="contained"
          onPress={() => router.push({ pathname: '/nueva-note', params: { type: 'note' } })}
        >
          Nueva nota
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
