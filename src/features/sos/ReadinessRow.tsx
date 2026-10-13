import { router, useFocusEffect } from 'expo-router';
import { CheckCircle2, ChevronRight, CircleAlert } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { AppState, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import {
  checkPermission,
  criticalForPlatform,
  openAppSettings,
  requestPermission,
  type PermKey,
} from '@/features/permissions/permissions';
import { S, t } from '@/lib/strings.es';
import { useCircle } from '@/store/circleStore';
import { HAIRLINE, alpha, palette, radius, spacing } from '@/theme';

type Missing = 'circle' | PermKey;

/** Lo que le falta a "Pedir ayuda" para funcionar completo, en orden de importancia. */
function useReadiness() {
  const contacts = useCircle((s) => s.contacts.length);
  const [perms, setPerms] = useState<Partial<Record<PermKey, string>>>({});

  const refresh = useCallback(async () => {
    const next: Partial<Record<PermKey, string>> = {};
    for (const k of criticalForPlatform()) next[k] = await checkPermission(k);
    setPerms(next);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      const sub = AppState.addEventListener('change', (s) => s === 'active' && void refresh());
      return () => sub.remove();
    }, [refresh]),
  );

  const missing: Missing[] = [];
  if (contacts === 0) missing.push('circle');
  for (const k of criticalForPlatform()) if (perms[k] !== undefined && perms[k] !== 'granted') missing.push(k);
  const loaded = Object.keys(perms).length > 0;
  return { contacts, missing, loaded, perms, refresh };
}

const LABEL: Record<Missing, string> = {
  circle: S.home.missingCircle,
  location: S.home.missingLocation,
  sms: S.home.missingSms,
  notifications: '',
};

/** Una sola línea bajo el orbe: "Ayuda lista" o el siguiente paso que falta (y lo resuelve al tocar). */
export function ReadinessRow() {
  const { contacts, missing, loaded, perms, refresh } = useReadiness();
  if (!loaded) return <View style={{ height: 56 }} />;

  if (missing.length === 0) {
    return (
      <View
        style={[styles.row, { borderColor: alpha(palette.success, 0.25) }]}
        accessible
        accessibilityLabel={`${S.home.ready}. ${t(S.home.readyBody, { n: contacts })}`}
      >
        <CheckCircle2 size={20} color={palette.success} strokeWidth={2} />
        <View style={{ flex: 1 }}>
          <AppText variant="bodyStrong">{S.home.ready}</AppText>
          <AppText variant="caption" tone="textMuted">
            {t(S.home.readyBody, { n: contacts })}
          </AppText>
        </View>
      </View>
    );
  }

  const first = missing[0];
  const fix = async () => {
    if (first === 'circle') return router.push('/circulo/nuevo');
    if (perms[first] === 'blocked') await openAppSettings();
    else await requestPermission(first);
    await refresh();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${S.home.missingTitle}. ${LABEL[first]}`}
      onPress={() => void fix()}
      style={({ pressed }) => [
        styles.row,
        { borderColor: alpha(palette.warning, 0.3), backgroundColor: alpha(palette.warning, 0.06) },
        { opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <CircleAlert size={20} color={palette.warning} strokeWidth={2} />
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong">{S.home.missingTitle}</AppText>
        <AppText variant="caption" tone="textMuted">
          {LABEL[first]}
          {missing.length > 1 ? ` (+${missing.length - 1})` : ''}
        </AppText>
      </View>
      <ChevronRight size={18} color={palette.textMuted} strokeWidth={1.75} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: HAIRLINE,
    backgroundColor: palette.glass,
  },
});
