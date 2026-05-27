import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface NoteCardProps {
  title: string;
  excerpt: string;
  date: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

export default function NoteCard({ title, excerpt, date, onPress, onLongPress }: NoteCardProps) {
  return (
    <Card style={styles.card} onPress={onPress} onLongPress={onLongPress}>
      <Card.Title title={title} titleNumberOfLines={1} />
      <Card.Content>
        <Text numberOfLines={2}>{excerpt}</Text>
      </Card.Content>
      <Card.Actions>
        <Text style={styles.date} numberOfLines={1}>{date}</Text>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  date: {
    color: '#6B6B80',
  },
});
