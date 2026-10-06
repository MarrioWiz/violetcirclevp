import { Phone } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { call911 } from '@/features/emergency/call';
import { S } from '@/lib/strings.es';
import { MIN_TOUCH, radius, spacing, useTheme } from '@/theme';

import { AppText } from './AppText';

/** Franja discreta "Si estás en peligro inmediato, llama al 911". Único uso del rojo junto al bloque urgente. */
export function EmergencyBanner() {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={S.emergency.banner}
      accessibilityHint="Abre la confirmación para llamar al 911"
      onPress={call911}
      style={({ pressed }) => [styles.bar, { backgroundColor: colors.dangerSoft, opacity: pressed ? 0.8 : 1 }]}
    >
      <Phone size={16} color={colors.danger} strokeWidth={2.2} />
      <AppText variant="caption" tone="danger" style={{ fontFamily: 'Inter_600SemiBold', flexShrink: 1 }}>
        {S.emergency.banner}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: MIN_TOUCH - 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
});
