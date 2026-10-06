import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { HAIRLINE, palette, radius, spacing, useTheme } from '@/theme';

import { Sheen } from './Sheen';

interface Props {
  /** Nombre en la cabecera (mono, como un archivo). */
  name: string;
  /** Texto pequeño a la derecha de la cabecera (fecha, tiempo de lectura…). */
  meta?: string;
  accent?: string;
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** Tarjeta oscura tipo "archivo": cabecera con cuadradito de color + nombre en mono, separador y cuerpo. */
export function FileCard({ name, meta, accent: accentProp, children, onPress, accessibilityLabel, style }: Props) {
  const { accent } = useTheme();
  const tint = accentProp ?? accent;
  const body = (
    <>
      <Sheen />
      <View style={styles.head}>
        <View style={[styles.square, { backgroundColor: tint }]} />
        <AppText variant="mono" tone="textMuted" numberOfLines={1} style={{ flex: 1 }}>
          {name}
        </AppText>
        {meta ? (
          <AppText variant="mono" tone="textMuted">
            {meta}
          </AppText>
        ) : null}
      </View>
      <View style={styles.sep} />
      <View style={styles.body}>{children}</View>
    </>
  );
  if (!onPress) return <View style={[styles.card, style]}>{body}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? name}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        style,
        { transform: [{ scale: pressed ? 0.985 : 1 }], opacity: pressed ? 0.92 : 1 },
      ]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.glass,
    borderColor: palette.stroke,
    borderWidth: HAIRLINE,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  square: { width: 8, height: 8, borderRadius: 2 },
  sep: { height: HAIRLINE, backgroundColor: palette.stroke },
  body: { padding: spacing.lg, gap: spacing.xs },
});
