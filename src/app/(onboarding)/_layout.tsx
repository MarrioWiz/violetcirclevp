import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

export default function OnboardingLayout() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="bienvenida" />
      <Stack.Screen name="consentimiento" />
      <Stack.Screen name="crear-pin" options={{ gestureEnabled: false }} />
      <Stack.Screen name="primer-circulo" options={{ gestureEnabled: false }} />
      <Stack.Screen name="estadisticas" />
    </Stack>
  );
}
