import { StyleSheet, View } from 'react-native';
import { Card, ProgressBar, Text } from 'react-native-paper';

interface ChecklistCardProps {
  title: string;
  completed: number;
  total: number;
  onPress?: () => void;
}

export default function ChecklistCard({ title, completed, total, onPress }: ChecklistCardProps) {
  const progress = total > 0 ? completed / total : 0;

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Title title={title} titleNumberOfLines={1} />
      <Card.Content>
        <View style={styles.row}>
          <Text numberOfLines={1}>{`${completed} / ${total} completadas`}</Text>
          <Text numberOfLines={1}>{`${Math.round(progress * 100)}%`}</Text>
        </View>
        <ProgressBar progress={progress} color="#5B56D6" style={styles.progress} />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progress: {
    height: 8,
    borderRadius: 8,
  },
});
