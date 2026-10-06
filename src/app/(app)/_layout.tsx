import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

export default function AppLayout() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="alerta" options={{ presentation: 'modal' }} />
      <Stack.Screen name="circulo/nuevo" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
