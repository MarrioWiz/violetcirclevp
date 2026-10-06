import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { HAIRLINE, gradients, palette, radius, spacing, useTheme } from '@/theme';

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
    primary: { bg: 'transparent', fg: palette.white },
    secondary: { bg: palette.glassStrong, fg: colors.text, border: palette.strokeStrong },
    outline: { bg: palette.glass, fg: colors.text, border: palette.stroke },
    ghost: { bg: 'transparent', fg: colors.primary },
    danger: { bg: colors.danger, fg: colors.onDanger },
    inverse: { bg: palette.glassStrong, fg: palette.white, border: palette.strokeStrong },
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
          {variant === 'primary' && (
            <LinearGradient
              colors={gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: radius.pill, opacity: pressed ? 0.9 : 1 }]}
            />
          )}
          {variant === 'primary' && <View style={styles.primaryRim} pointerEvents="none" />}
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
  primaryRim: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.pill,
    borderWidth: HAIRLINE,
    borderColor: palette.strokeStrong,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
