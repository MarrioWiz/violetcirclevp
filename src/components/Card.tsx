import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { HAIRLINE, alpha, palette, radius, spacing, useTheme } from '@/theme';


interface Props {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /**
   * surface = tarjeta sólida (default) · strong = un tono más claro · accent = teñida con el acento ·
   * soft = teñido violeta · danger/success/warning = estados.
   */
  tone?: 'surface' | 'strong' | 'accent' | 'soft' | 'danger' | 'success' | 'warning';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  padded?: boolean;
}

/** Tarjeta sólida y muy redondeada (estilo banca móvil): sin bordes, el color hace la jerarquía. */
export function Card({
  children,
  onPress,
  style,
  tone = 'surface',
  accessibilityLabel,
  accessibilityHint,
  padded = true,
}: Props) {
  const { accent } = useTheme();
  const look = {
    surface: { bg: palette.glass, border: 'transparent' },
    strong: { bg: palette.glassStrong, border: 'transparent' },
    accent: { bg: alpha(accent, 0.14), border: 'transparent' },
    soft: { bg: alpha(palette.violet, 0.14), border: 'transparent' },
    danger: { bg: alpha(palette.danger, 0.14), border: alpha(palette.danger, 0.3) },
    success: { bg: alpha(palette.success, 0.12), border: 'transparent' },
    warning: { bg: alpha(palette.warning, 0.12), border: 'transparent' },
  }[tone];
  const base = [styles.card, { backgroundColor: look.bg, borderColor: look.border }, padded && styles.padded, style];
  const content = <>{children}</>;

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
  card: { borderRadius: radius.xl, borderWidth: HAIRLINE, overflow: 'hidden' },
  padded: { padding: spacing.lg },
});

/** Separa visualmente una sección. */
export function Gap({ size = spacing.lg }: { size?: number }) {
  return <View style={{ height: size }} />;
}
