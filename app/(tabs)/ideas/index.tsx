import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeOutLeft } from 'react-native-reanimated';
import { useState, useMemo } from 'react';
import IdeaCard from '../../../components/items/IdeaCard';
import EmptyState from '../../../components/EmptyState';
import { useNotesStore } from '../../../store/notesStore';

export default function IdeasScreen() {
  const router = useRouter();
  const { ideas } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIdeas = useMemo(() => {
    if (!searchQuery.trim()) return ideas;
    return ideas.filter(
      (idea) =>
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [ideas, searchQuery]);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Ideas
        </Text>
        <TextInput
          placeholder="Buscar ideas..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
        />
      </View>

      {filteredIdeas.length === 0 ? (
        <EmptyState
          icon="lightbulb-outline"
          title="Sin ideas"
          message={
            searchQuery
              ? `No se encontraron ideas con "${searchQuery}"`
              : 'Captura tu primera idea rápida'
          }
        />
      ) : (
        <FlashList
          data={filteredIdeas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Animated.View entering={FadeInDown} exiting={FadeOutLeft}>
              <IdeaCard
                title={item.title}
                tags={item.tags}
                color={item.color}
                onPress={() => router.push(`/ideas/${item.id}`)}
              />
            </Animated.View>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <View style={styles.buttonWrapper}>
        <Button
          mode="contained"
          onPress={() => router.push({ pathname: '/nueva-note', params: { type: 'idea' } })}
        >
          Nueva idea
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
