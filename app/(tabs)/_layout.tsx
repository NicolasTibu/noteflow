import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import { useNoteFlowTheme } from '../../constants/theme';
import { useNotesStore } from '../../store/notesStore';
import { UserHeader } from '../../components/UserHeader';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const TAB_ICONS: Record<string, IconName> = {
  notas: 'note-multiple',
  checklists: 'checkbox-marked-circle',
  ideas: 'lightbulb',
  archivadas: 'archive-outline',
};

function TabIcon({ name, color, size }: { name: IconName; color: string; size: number }) {
  return <MaterialCommunityIcons name={name} color={color} size={size ?? 24} />;
}

export default function TabsLayout() {
  const theme = useNoteFlowTheme();
  const fetchNotes = useNotesStore((state) => state.fetchNotes);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createTabIcon = (iconName: IconName) => {
    const TabBarIcon = ({ color, size }: { color: string; size: number }) => (
      <TabIcon name={iconName} color={color} size={size} />
    );
    TabBarIcon.displayName = `TabIcon(${iconName})`;
    return TabBarIcon;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Noteflow</Text>
        <UserHeader showActions={true} showChangePhoto={true} />
      </View>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            height: 80,
            paddingBottom: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: '#E9E8F5',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="notas"
          options={{
            title: 'Notas',
            tabBarIcon: createTabIcon(TAB_ICONS.notas),
          }}
        />

        <Tabs.Screen
          name="checklists"
          options={{
            title: 'Tareas',
            tabBarIcon: createTabIcon(TAB_ICONS.checklists),
          }}
        />

        <Tabs.Screen
          name="ideas"
          options={{
            title: 'Ideas',
            tabBarIcon: createTabIcon(TAB_ICONS.ideas),
          }}
        />

        <Tabs.Screen
          name="archivadas"
          options={{
            title: 'Archivadas',
            tabBarIcon: createTabIcon(TAB_ICONS.archivadas),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B1B1F',
  },
});
