import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface IdeaCardProps {
  title: string;
  tags: string[];
  color: string;
  onPress?: () => void;
}

export default function IdeaCard({ title, tags, color, onPress }: IdeaCardProps) {
  return (
    <Card style={[styles.card, { backgroundColor: color }]} onPress={onPress}>
      <Card.Title title={title} titleStyle={styles.title} titleNumberOfLines={1} />
      <Card.Content>
        <View style={styles.tagsContainer}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>{tag}</Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  title: {
    color: '#1F1B33',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  tagText: {
    color: '#1F1B33',
    fontSize: 12,
  },
});
