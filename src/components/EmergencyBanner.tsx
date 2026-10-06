import { Phone } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { call911 } from '@/features/emergency/call';
import { S } from '@/lib/strings.es';
import { HAIRLINE, MIN_TOUCH, alpha, palette, radius, spacing } from '@/theme';

import { AppText } from './AppText';

/** Franja de vidrio del 911: el ÚNICO lugar con tinte rojo junto a la alerta. */
export function EmergencyBanner() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={S.emergency.banner}
      accessibilityHint="Abre la confirmación para llamar al 911"
      onPress={call911}
      style={({ pressed }) => [styles.bar, { opacity: pressed ? 0.8 : 1 }]}
    >
      <Phone size={16} color={palette.danger} strokeWidth={2} />
      <AppText variant="caption" style={styles.text}>
        {S.emergency.banner}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: MIN_TOUCH - 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: palette.glass,
    borderWidth: HAIRLINE,
    borderColor: alpha(palette.danger, 0.35),
  },
  text: { color: palette.text, flexShrink: 1 },
});
