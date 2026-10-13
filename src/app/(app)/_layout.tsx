import { Stack } from 'expo-router';
import { View } from 'react-native';

import { AssistantFab } from '@/features/assistant/AssistantFab';
import { useTheme } from '@/theme';

export default function AppLayout() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="alerta" options={{ presentation: 'modal' }} />
        <Stack.Screen name="circulo/nuevo" options={{ presentation: 'modal' }} />
        <Stack.Screen name="asistente" options={{ presentation: 'modal' }} />
      </Stack>
      {/* Vi: encima de todas las pantallas de la app (debajo del PIN, la alerta y la calculadora). */}
      <AssistantFab />
    </View>
  );
}
