import { useFocusEffect } from 'expo-router';
import { ChevronRight, CircleAlert } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { AppState, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import {
  checkPermission,
  criticalForPlatform,
  openAppSettings,
  requestPermission,
  type PermKey,
  type PermState,
} from '@/features/permissions/permissions';
import { S } from '@/lib/strings.es';
import { HAIRLINE, alpha, palette, radius, spacing } from '@/theme';

const LABEL: Partial<Record<PermKey, string>> = {
  location: S.home.missingLocation,
  sms: S.home.missingSms,
};

/**
 * Aviso bajo el orbe SOLO si a "Pedir ayuda" le falta un permiso (ubicación, o SMS en Android).
 * Al tocarlo lo pide (o abre Ajustes si se negó para siempre). Si todo está bien, no se muestra.
 * El círculo vacío se ve en el propio orbe (satélite "+").
 */
export function ReadinessRow() {
  const [perms, setPerms] = useState<Partial<Record<PermKey, PermState>>>({});

  const refresh = useCallback(async () => {
    const next: Partial<Record<PermKey, PermState>> = {};
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

  const missing = criticalForPlatform().filter((k) => perms[k] !== undefined && perms[k] !== 'granted');
  if (missing.length === 0) return null;
  const first = missing[0];

  const fix = async () => {
    if (perms[first] === 'blocked') await openAppSettings();
    else await requestPermission(first);
    await refresh();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${S.home.missingTitle}. ${LABEL[first]}`}
      onPress={() => void fix()}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.8 : 1 }]}
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
    borderColor: alpha(palette.warning, 0.3),
    backgroundColor: alpha(palette.warning, 0.06),
  },
});
