import { router, useFocusEffect, type Href } from 'expo-router';
import { ChevronRight, Compass, NotebookPen, Phone, Siren, type LucideIcon } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Divider } from '@/components/Rows';
import { Screen } from '@/components/Screen';
import { tabMeta } from '@/components/dock/tabs';
import { IconBadge } from '@/components/IconBadge';
import { call911 } from '@/features/emergency/call';
import { HoldToHelpOrb } from '@/features/sos/HoldToHelpOrb';
import { ReadinessRow } from '@/features/sos/ReadinessRow';
import { sosNative } from '@/features/sos/sosService';
import { SIMULATED, sosSim } from '@/features/sos/webSimulator';
import { S } from '@/lib/strings.es';
import { HAIRLINE, palette, radius, spacing } from '@/theme';

interface Shortcut {
  key: string;
  icon: LucideIcon;
  title: string;
  body: string;
  danger?: boolean;
  onPress: () => void;
}

function ShortcutRow({ s }: { s: Shortcut }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${s.title}. ${s.body}`}
      onPress={s.onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <IconBadge icon={s.icon} size={42} tone={s.danger ? 'danger' : 'accent'} />
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong">{s.title}</AppText>
        <AppText variant="caption" tone="textMuted">
          {s.body}
        </AppText>
      </View>
      <ChevronRight size={18} color={palette.textMuted} strokeWidth={1.75} />
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
    { key: '911', icon: Phone, danger: true, ...sc.call911, onPress: () => void call911() },
    { key: 'orient', icon: Compass, ...sc.orient, onPress: () => router.push('/orientacion') },
    { key: 'save', icon: NotebookPen, ...sc.save, onPress: () => router.push('/bitacora/nueva') },
    // Solo en Android y mientras no esté configurado; después vive en Más → Pedir ayuda rápido.
    ...(quickHelpOn === false
      ? [{ key: 'quick', icon: Siren, ...sc.quickHelp, onPress: () => router.push('/ajustes/ayuda-rapida' as Href) }]
      : []),
  ];

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

      <View style={styles.list}>
        {shortcuts.map((s, i) => (
          <View key={s.key}>
            {i > 0 && <Divider />}
            <ShortcutRow s={s} />
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: HAIRLINE,
    borderColor: palette.stroke,
    backgroundColor: palette.glass,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 64, paddingVertical: spacing.sm },
});
