import { Tabs } from 'expo-router';
import { Compass, Ellipsis, House, LifeBuoy, Users } from 'lucide-react-native';
import { Platform } from 'react-native';

import { fonts, useTheme } from '@/theme';

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <House size={24} color={color} />,
          tabBarAccessibilityLabel: 'Inicio',
        }}
      />
      <Tabs.Screen
        name="orientacion"
        options={{
          title: 'Orientación',
          tabBarIcon: ({ color }) => <Compass size={24} color={color} />,
          tabBarAccessibilityLabel: '¿Esto es violencia digital?',
        }}
      />
      <Tabs.Screen
        name="circulo"
        options={{ title: 'Mi círculo', tabBarIcon: ({ color }) => <Users size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="directorio"
        options={{
          title: 'Directorio',
          tabBarIcon: ({ color }) => <LifeBuoy size={24} color={color} />,
          tabBarAccessibilityLabel: 'Directorio de apoyo',
        }}
      />
      <Tabs.Screen
        name="mas"
        options={{ title: 'Más', tabBarIcon: ({ color }) => <Ellipsis size={24} color={color} /> }}
      />
    </Tabs>
  );
}
