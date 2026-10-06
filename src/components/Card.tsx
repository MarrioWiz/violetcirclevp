import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, spacing, useTheme } from '@/theme';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  tone?: 'surface' | 'soft' | 'danger' | 'success' | 'warning';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  padded?: boolean;
}

export function Card({ children, onPress, style, tone = 'surface', accessibilityLabel, accessibilityHint, padded = true }: Props) {
  const { colors, scheme } = useTheme();
  const bg = {
    surface: colors.surface,
    soft: colors.primarySoft,
    danger: colors.dangerSoft,
    success: colors.successSoft,
    warning: colors.warningSoft,
  }[tone];
  const shadow =
    tone === 'surface'
      ? {
          shadowColor: colors.shadow,
          shadowOpacity: scheme === 'dark' ? 0.35 : 0.07,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 6 },
          elevation: 2,
        }
      : null;
  const base = [
    styles.card,
    { backgroundColor: bg, borderColor: tone === 'surface' ? colors.border : 'transparent' },
    padded && styles.padded,
    shadow,
    style,
  ];

  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => [base, { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth },
  padded: { padding: spacing.lg },
});

/** Separa visualmente una sección. */
export function Gap({ size = spacing.lg }: { size?: number }) {
  return <View style={{ height: size }} />;
}
