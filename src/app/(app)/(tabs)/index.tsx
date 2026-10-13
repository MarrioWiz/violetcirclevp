import { router, useFocusEffect, type Href } from 'expo-router';
import { ChevronRight, Compass, NotebookPen, Phone, Send, Siren, type LucideIcon } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { tabMeta } from '@/components/dock/tabs';
import { IconBadge } from '@/components/IconBadge';
import { call911 } from '@/features/emergency/call';
import { HoldToHelpOrb } from '@/features/sos/HoldToHelpOrb';
import { ReadinessRow } from '@/features/sos/ReadinessRow';
import { sosNative } from '@/features/sos/sosService';
import { SIMULATED, sosSim } from '@/features/sos/webSimulator';
import { S } from '@/lib/strings.es';
import { alpha, fonts, palette, radius, spacing, useTheme } from '@/theme';

interface Shortcut {
  key: string;
  icon: LucideIcon;
  title: string;
  body: string;
  /** Nombre corto bajo el círculo. */
  short: string;
  danger?: boolean;
  onPress: () => void;
}

/** Botón redondo con su nombre abajo (fila de acciones rápidas, estilo banca móvil). */
function ActionCircle({ s }: { s: Shortcut }) {
  const { accent } = useTheme();
  const tint = s.danger ? palette.danger : accent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${s.title}. ${s.body}`}
      onPress={s.onPress}
      style={({ pressed }) => [styles.action, { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}
    >
      <View style={[styles.circle, { backgroundColor: alpha(tint, 0.18) }]}>
        <s.icon size={24} color={tint} strokeWidth={2} />
      </View>
      <AppText variant="caption" center numberOfLines={2} style={{ fontFamily: fonts.semi, color: palette.text }}>
        {s.short}
      </AppText>
    </Pressable>
  );
}

const triggers = sosNative ?? (SIMULATED ? sosSim : null);

/** ¿Ya puede pedir ayuda sin abrir la app? (APK de Android; en web, simulado). */
function useQuickHelpConfigured(): boolean | null {
  const [on, setOn] = useState<boolean | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (!triggers) return;
      setOn(triggers.isVolumeTriggerEnabled() || triggers.isIconShortcutEnabled() || triggers.isLauncherEntryEnabled());
    }, []),
  );
  return triggers ? on : true;
}

/**
 * Inicio: el orbe "Pedir ayuda" con tu círculo en órbita, y debajo tres atajos de un toque.
 */
export default function Home() {
  const meta = tabMeta('index');
  const greeting = useMemo(() => S.home.greeting[new Date().getDate() % S.home.greeting.length], []);
  const quickHelpOn = useQuickHelpConfigured();
  const sc = S.home.shortcuts;

  const shortcuts: Shortcut[] = [
    { key: '911', icon: Phone, danger: true, ...sc.call911, short: '911', onPress: () => void call911() },
    {
      key: 'notify',
      icon: Send,
      title: 'Avisar a mi círculo',
      body: 'Prepara el mensaje para tus personas de confianza',
      short: 'Avisar',
      onPress: () => router.push({ pathname: '/alerta', params: { compose: '1' } }),
    },
    { key: 'orient', icon: Compass, ...sc.orient, short: '¿Es violencia?', onPress: () => router.push('/orientacion') },
    { key: 'save', icon: NotebookPen, ...sc.save, short: 'Guardar prueba', onPress: () => router.push('/bitacora/nueva') },
  ];
  const quick = sc.quickHelp;

  return (
    <Screen
      dock
      title={meta.title}
      subtitle={meta.subtitle}
      eyebrow={greeting}
      footer={
        <AppText variant="caption" tone="textMuted" center>
          {S.home.scopeLine}
        </AppText>
      }
    >
      {/* Tocar = opciones de ayuda; mantener 2 s = SMS con ubicación. */}
      <HoldToHelpOrb />
      <ReadinessRow />

      <View style={styles.actions}>
        {shortcuts.map((s) => (
          <ActionCircle key={s.key} s={s} />
        ))}
      </View>

      {/* Solo en Android (o simulado en web) y mientras no esté configurado. */}
      {quickHelpOn === false && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${quick.title}. ${quick.body}`}
          onPress={() => router.push('/ajustes/ayuda-rapida' as Href)}
          style={({ pressed }) => [styles.promo, { opacity: pressed ? 0.85 : 1 }]}
        >
          <IconBadge icon={Siren} size={44} />
          <View style={{ flex: 1 }}>
            <AppText variant="bodyStrong">{quick.title}</AppText>
            <AppText variant="caption" tone="textMuted">
              {quick.body}
            </AppText>
          </View>
          <ChevronRight size={18} color={palette.textMuted} strokeWidth={1.75} />
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg, gap: spacing.sm },
  action: { flex: 1, alignItems: 'center', gap: spacing.sm },
  circle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: palette.glass,
  },
});
