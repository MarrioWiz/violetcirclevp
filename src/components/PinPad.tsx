import * as Haptics from 'expo-haptics';
import { Delete, ScanFace } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { spacing, useTheme } from '@/theme';

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

export function PinDots({ length, filled, error }: { length: number; filled: number; error?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${filled} de ${length} dígitos escritos`}
      style={{ flexDirection: 'row', gap: spacing.lg, justifyContent: 'center', marginVertical: spacing.xl }}
    >
      {Array.from({ length }).map((_, i) => (
        <View
          key={i}
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: error ? colors.danger : colors.primary,
            backgroundColor: i < filled ? (error ? colors.danger : colors.primary) : 'transparent',
          }}
        />
      ))}
    </View>
  );
}

export function PinPad({ value, length, onChange, onBiometric, biometricLabel, disabled }: Props) {
  const { colors } = useTheme();

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
        const label = k === 'del' ? 'Borrar' : k === 'bio' ? biometricLabel ?? 'Biometría' : k;
        return (
          <Pressable
            key={k}
            accessibilityRole="button"
            accessibilityLabel={label}
            disabled={disabled}
            onPress={() => press(k)}
            style={({ pressed }) => [
              styles.key,
              k !== 'del' && k !== 'bio' && { backgroundColor: pressed ? colors.primarySoft : colors.surface, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
              { opacity: disabled ? 0.4 : 1 },
            ]}
          >
            {k === 'del' ? (
              <Delete size={26} color={colors.text} />
            ) : k === 'bio' ? (
              <ScanFace size={28} color={colors.primary} />
            ) : (
              <AppText variant="title" style={{ fontFamily: 'Inter_500Medium' }}>
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
    maxWidth: 300,
    alignSelf: 'center',
  },
  key: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
