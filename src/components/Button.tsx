import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { HAIRLINE, palette, radius, spacing, useTheme } from '@/theme';

import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'inverse';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
  size?: 'md' | 'lg';
  accessibilityHint?: string;
  style?: ViewStyle;
}

/**
 * Botones en píldora:
 * - primary: gradiente violeta, texto blanco.
 * - secondary / outline: vidrio + borde hairline.
 * - ghost: solo texto.
 * - danger: SOLO 911 y acciones destructivas.
 * - inverse: vidrio claro para fondos de color (pantalla "Pedir ayuda").
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  disabled,
  loading,
  size = 'md',
  accessibilityHint,
  style,
}: Props) {
  const { colors } = useTheme();

  const look: Record<Variant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: palette.violet, fg: palette.white },
    secondary: { bg: palette.glassStrong, fg: colors.text },
    outline: { bg: 'transparent', fg: colors.text, border: palette.strokeStrong },
    ghost: { bg: 'transparent', fg: colors.primary },
    danger: { bg: colors.danger, fg: colors.onDanger },
    inverse: { bg: 'rgba(255,255,255,0.14)', fg: palette.white },
  };
  const p = look[variant];
  const inactive = disabled || loading;
  const height = size === 'lg' ? 56 : 52;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: height,
          backgroundColor: p.bg,
          borderColor: p.border ?? 'transparent',
          borderWidth: p.border ? HAIRLINE : 0,
          opacity: inactive ? 0.4 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {({ pressed }) => (
        <>
          {pressed && <View style={[StyleSheet.absoluteFill, styles.pressed]} pointerEvents="none" />}
          {loading ? (
            <ActivityIndicator color={p.fg} />
          ) : (
            <View style={styles.row}>
              {Icon ? <Icon size={20} color={p.fg} strokeWidth={1.9} /> : null}
              <AppText variant="bodyStrong" style={{ color: p.fg }} center>
                {label}
              </AppText>
            </View>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pressed: { backgroundColor: 'rgba(0,0,0,0.15)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
