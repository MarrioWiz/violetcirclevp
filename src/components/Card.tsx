import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { HAIRLINE, alpha, palette, radius, spacing, useTheme } from '@/theme';

import { Sheen } from './ui/Sheen';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /**
   * surface = vidrio (GlassCard default) · strong = vidrio más denso · accent = teñido con el acento ·
   * soft = teñido violeta · danger/success/warning = estados.
   */
  tone?: 'surface' | 'strong' | 'accent' | 'soft' | 'danger' | 'success' | 'warning';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  padded?: boolean;
}

/** Tarjeta de vidrio: relleno translúcido, borde hairline y brillo superior de 1 px. */
export function Card({
  children,
  onPress,
  style,
  tone = 'surface',
  accessibilityLabel,
  accessibilityHint,
  padded = true,
}: Props) {
  const { colors, accent } = useTheme();
  const look = {
    surface: { bg: palette.glass, border: palette.stroke, sheen: undefined },
    strong: { bg: palette.glassStrong, border: palette.strokeStrong, sheen: undefined },
    accent: { bg: alpha(accent, 0.08), border: alpha(accent, 0.25), sheen: accent },
    soft: { bg: colors.primarySoft, border: alpha(palette.violet, 0.25), sheen: palette.violet },
    danger: { bg: colors.dangerSoft, border: alpha(palette.danger, 0.35), sheen: palette.danger },
    success: { bg: colors.successSoft, border: alpha(palette.success, 0.25), sheen: palette.success },
    warning: { bg: colors.warningSoft, border: alpha(palette.warning, 0.25), sheen: palette.warning },
  }[tone];
  const base = [styles.card, { backgroundColor: look.bg, borderColor: look.border }, padded && styles.padded, style];
  const content = (
    <>
      <Sheen color={look.sheen} />
      {children}
    </>
  );

  if (!onPress) return <View style={base}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => [base, { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: HAIRLINE, overflow: 'hidden' },
  padded: { padding: spacing.lg },
});

/** Separa visualmente una sección. */
export function Gap({ size = spacing.lg }: { size?: number }) {
  return <View style={{ height: size }} />;
}
