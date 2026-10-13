import { LinearGradient } from 'expo-linear-gradient';
import { Check, ChevronRight, type LucideIcon } from 'lucide-react-native';
import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { HAIRLINE, MIN_TOUCH, alpha, fonts, palette, radius, spacing, useTheme } from '@/theme';

import { AppText } from './AppText';
import { IconBadge } from './IconBadge';

// ── Fila de lista ─────────────────────────────────────────────────────────

interface ListRowProps {
  title: string;
  body?: string;
  icon?: LucideIcon;
  iconTone?: 'primary' | 'accent' | 'danger' | 'success' | 'warning';
  onPress?: () => void;
  right?: ReactNode;
  destructive?: boolean;
  accessibilityHint?: string;
}

export function ListRow({ title, body, icon, iconTone, onPress, right, destructive, accessibilityHint }: ListRowProps) {
  const { colors } = useTheme();
  const content = (
    <>
      {icon ? <IconBadge icon={icon} size={40} tone={destructive ? 'danger' : (iconTone ?? 'accent')} /> : null}
      <View style={styles.flex}>
        <AppText variant="bodyStrong" tone={destructive ? 'danger' : 'text'}>
          {title}
        </AppText>
        {body ? (
          <AppText variant="caption" tone="textMuted">
            {body}
          </AppText>
        ) : null}
      </View>
      {right ?? (onPress ? <ChevronRight size={18} color={colors.textMuted} strokeWidth={1.75} /> : null)}
    </>
  );
  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={body ? `${title}. ${body}` : title}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

// ── Interruptor de vidrio ────────────────────────────────────────────────

const TRACK_W = 52;
const TRACK_H = 32;
const THUMB = 24;

export function GlassSwitch({
  value,
  onChange,
  disabled,
  label,
  hint,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label: string;
  hint?: string;
}) {
  const { accent } = useTheme();
  const reduceMotion = useReducedMotion();
  const pos = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    pos.value = reduceMotion ? (value ? 1 : 0) : withTiming(value ? 1 : 0, { duration: 180 });
  }, [value, reduceMotion, pos]);
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: 4 + pos.value * (TRACK_W - THUMB - 8) }] }));
  const fill = useAnimatedStyle(() => ({ opacity: pos.value }));
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={() => onChange(!value)}
      style={[styles.track, { opacity: disabled ? 0.4 : 1 }]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, fill]}>
        <LinearGradient
          colors={[alpha(accent, 0.95), alpha(accent, 0.6)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
        />
      </Animated.View>
      <Animated.View style={[styles.thumb, thumb]} />
    </Pressable>
  );
}

export function ToggleRow({
  title,
  body,
  value,
  onChange,
  disabled,
  icon,
}: {
  title: string;
  body?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <View style={styles.row}>
      {icon ? <IconBadge icon={icon} size={40} /> : null}
      <View style={styles.flex}>
        <AppText variant="bodyStrong">{title}</AppText>
        {body ? (
          <AppText variant="caption" tone="textMuted">
            {body}
          </AppText>
        ) : null}
      </View>
      <GlassSwitch label={title} hint={body} value={value} onChange={onChange} disabled={disabled} />
    </View>
  );
}

// ── Casilla ──────────────────────────────────────────────────────────────

export function CheckRow({
  label,
  detail,
  checked,
  onToggle,
}: {
  label: string;
  detail?: string;
  checked: boolean;
  onToggle: () => void;
}) {
  const { accent } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={detail ? `${label}. ${detail}` : label}
      onPress={onToggle}
      style={({ pressed }) => [styles.checkRow, { opacity: pressed ? 0.75 : 1 }]}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: checked ? alpha(accent, 0.6) : palette.strokeStrong,
            backgroundColor: checked ? alpha(accent, 0.9) : palette.glass,
          },
        ]}
      >
        {checked ? <Check size={15} color={palette.bg0} strokeWidth={3} /> : null}
      </View>
      <View style={styles.flex}>
        {/* Sin tachado: lo hecho se marca con la palomita y queda legible. */}
        <AppText variant="bodyStrong">{label}</AppText>
        {detail ? (
          <AppText variant="caption" tone="textMuted" style={{ marginTop: 2 }}>
            {detail}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

// ── Separadores y títulos ────────────────────────────────────────────────

export function Divider() {
  return <View style={{ height: HAIRLINE, backgroundColor: palette.stroke, marginVertical: spacing.xs }} />;
}

/** Título de sección: texto limpio, sin mayúsculas ni adornos. */
export function SectionTitle({ children }: { children: string }) {
  return (
    <AppText
      variant="subheading"
      tone="textMuted"
      accessibilityRole="header"
      style={{ marginTop: spacing.x3, marginBottom: spacing.md }}
    >
      {children}
    </AppText>
  );
}

// ── Chips y selector segmentado ──────────────────────────────────────────

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { accent, colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? alpha(accent, 0.18) : palette.glass,
          borderColor: selected ? alpha(accent, 0.5) : palette.stroke,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <AppText variant="caption" style={{ fontFamily: fonts.semi, color: selected ? accent : colors.text }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  const { accent, colors } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.segment}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            onPress={() => onChange(o.value)}
            style={[
              styles.segmentItem,
              selected && { backgroundColor: alpha(accent, 0.16), borderColor: alpha(accent, 0.4) },
            ]}
          >
            <AppText variant="caption" style={{ fontFamily: fonts.semi, color: selected ? accent : colors.textMuted }}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: MIN_TOUCH + 8,
    paddingVertical: spacing.sm,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: MIN_TOUCH,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: radius.xs,
    borderWidth: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: radius.pill,
    backgroundColor: palette.glassStrong,
    borderWidth: HAIRLINE,
    borderColor: palette.strokeStrong,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: palette.text,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
    backgroundColor: palette.glass,
    borderWidth: HAIRLINE,
    borderColor: palette.stroke,
  },
  segmentItem: {
    flex: 1,
    minHeight: MIN_TOUCH - 4,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    borderWidth: HAIRLINE,
    borderColor: 'transparent',
  },
});
