import * as Haptics from 'expo-haptics';
import { Delete, ScanFace } from 'lucide-react-native';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { HAIRLINE, alpha, fonts, palette, spacing, useTheme } from '@/theme';

import { AppText } from './AppText';

interface Props {
  value: string;
  length: number;
  onChange: (v: string) => void;
  onBiometric?: () => void;
  biometricLabel?: string;
  error?: boolean;
  disabled?: boolean;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'bio', '0', 'del'] as const;
const KEY = 72;

/** Puntos del PIN: se rellenan con el acento; sacudida suave al fallar (no con Reducir movimiento). */
export function PinDots({ length, filled, error }: { length: number; filled: number; error?: boolean }) {
  const { accent, colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const shake = useSharedValue(0);
  useEffect(() => {
    if (!error || reduceMotion) return;
    shake.value = withSequence(
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(-5, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    );
  }, [error, reduceMotion, shake]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const tint = error ? colors.danger : accent;
  return (
    <Animated.View
      accessible
      accessibilityLabel={`${filled} de ${length} dígitos escritos`}
      style={[{ flexDirection: 'row', gap: spacing.lg, justifyContent: 'center', marginVertical: spacing.xl }, style]}
    >
      {Array.from({ length }).map((_, i) => (
        <View
          key={i}
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            borderWidth: HAIRLINE,
            borderColor: i < filled ? alpha(tint, 0.8) : palette.strokeStrong,
            backgroundColor: i < filled ? tint : palette.glass,
          }}
        />
      ))}
    </Animated.View>
  );
}

/** Teclado de círculos de vidrio de 72 pt. */
export function PinPad({ value, length, onChange, onBiometric, biometricLabel, disabled }: Props) {
  const { colors, accent } = useTheme();

  const press = (k: (typeof KEYS)[number]) => {
    if (disabled) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => undefined);
    if (k === 'del') onChange(value.slice(0, -1));
    else if (k === 'bio') onBiometric?.();
    else if (value.length < length) onChange(value + k);
  };

  return (
    <View style={styles.grid}>
      {KEYS.map((k) => {
        if (k === 'bio' && !onBiometric) return <View key={k} style={styles.key} />;
        const label = k === 'del' ? 'Borrar' : k === 'bio' ? (biometricLabel ?? 'Biometría') : k;
        const isDigit = k !== 'del' && k !== 'bio';
        return (
          <Pressable
            key={k}
            accessibilityRole="button"
            accessibilityLabel={label}
            disabled={disabled}
            onPress={() => press(k)}
            style={({ pressed }) => [
              styles.key,
              isDigit && {
                backgroundColor: pressed ? alpha(accent, 0.18) : palette.glass,
                borderColor: pressed ? alpha(accent, 0.45) : palette.stroke,
                borderWidth: HAIRLINE,
              },
              { opacity: disabled ? 0.4 : 1 },
            ]}
          >
            {k === 'del' ? (
              <Delete size={24} color={colors.textMuted} strokeWidth={1.75} />
            ) : k === 'bio' ? (
              <ScanFace size={26} color={accent} strokeWidth={1.75} />
            ) : (
              <AppText variant="title" style={{ fontFamily: fonts.medium }}>
                {k}
              </AppText>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
    maxWidth: KEY * 3 + spacing.lg * 2 + 4,
    alignSelf: 'center',
  },
  key: {
    width: KEY,
    height: KEY,
    borderRadius: KEY / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
