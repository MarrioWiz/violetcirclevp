import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DisguiseCalculator } from '@/features/auth/DisguiseCalculator';
import { LockScreen } from '@/features/auth/LockScreen';
import { PrivacyCover } from '@/features/auth/PrivacyCover';
import { useAppLifecycle } from '@/features/auth/useAppLifecycle';
import { SetupGate, useSetupGate } from '@/features/permissions/SetupGate';
import { SosScreen } from '@/features/sos/SosScreen';
import { setScreenProtection } from '@/services/discreet';
import { useChecklist } from '@/store/checklistStore';
import { useCircle } from '@/store/circleStore';
import { useContent } from '@/store/contentStore';
import { useIncidents } from '@/store/incidentsStore';
import { useSession } from '@/store/sessionStore';
import { useSettings } from '@/store/settingsStore';
import { useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    JetBrainsMono_500Medium,
  });
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    void (async () => {
      await Promise.all([useSettings.getState().hydrate(), useSession.getState().hydrateDisguise()]);
      void useContent.getState().init();
      setBooted(true);
    })();
  }, []);

  // Si las fuentes fallan, seguimos con las del sistema en lugar de quedarnos en el splash.
  const ready = booted && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppShell />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppShell() {
  useAppLifecycle();
  const { scheme, colors } = useTheme();
  const onboarded = useSettings((s) => s.onboarded);
  const locked = useSession((s) => s.locked);
  const disguised = useSession((s) => s.disguised);
  const covered = useSession((s) => s.covered);
  const hidePreview = useSettings((s) => s.hidePreview);
  // "Pedir ayuda" va encima de todo (PIN y calculadora incluidos); solo tras el onboarding.
  const sos = useSession((s) => s.sosActive) && onboarded;

  // Sin capturas ni miniatura en "Recientes" (Android) mientras "Ocultar vista previa" esté activo.
  useEffect(() => {
    void setScreenProtection(hidePreview);
  }, [hidePreview]);

  const showLock = onboarded && locked;
  const hideBelow = showLock || sos;
  const unlocked = onboarded && !locked && !disguised;
  // Tras desbloquear: permisos críticos que falten y la guía de salida rápida (una vez).
  const gate = useSetupGate(unlocked && !sos);

  // Los datos cifrados se cargan en memoria solo después de desbloquear.
  useEffect(() => {
    if (!unlocked) return;
    if (!useCircle.getState().hydrated) void useCircle.getState().hydrate();
    if (!useChecklist.getState().hydrated) void useChecklist.getState().hydrate();
    if (!useIncidents.getState().hydrated) void useIncidents.getState().hydrate();
  }, [unlocked]);

  const navTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;

  // Salida rápida: se desmonta toda la navegación, así no queda historial al que regresar.
  if (disguised) {
    return (
      <View style={{ flex: 1 }}>
        <DisguiseCalculator />
        {sos && <SosOverlay />}
        {covered && <PrivacyCover />}
      </View>
    );
  }

  return (
    <ThemeProvider
      value={{ ...navTheme, colors: { ...navTheme.colors, background: colors.bg, primary: colors.primary } }}
    >
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {/* La navegación se mantiene montada bajo el bloqueo para no perder dónde estaba ella,
            pero queda oculta para lectores de pantalla y tapada por completo. */}
        <View
          style={{ flex: 1 }}
          importantForAccessibility={hideBelow ? 'no-hide-descendants' : 'auto'}
          accessibilityElementsHidden={hideBelow}
        >
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
            <Stack.Protected guard={!onboarded}>
              <Stack.Screen name="(onboarding)" />
            </Stack.Protected>
            <Stack.Protected guard={onboarded}>
              <Stack.Screen name="(app)" />
            </Stack.Protected>
          </Stack>
        </View>
        {unlocked && !sos && gate.pages.length > 0 && <SetupGate pages={gate.pages} close={gate.close} />}
        {showLock && (
          <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
            <LockScreen />
          </View>
        )}
        {sos && <SosOverlay />}
        {covered && <PrivacyCover />}
      </View>
    </ThemeProvider>
  );
}

function SosOverlay() {
  return (
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      <SosScreen />
    </View>
  );
}
