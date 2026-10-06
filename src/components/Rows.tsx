import { Check, ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { MIN_TOUCH, radius, spacing, useTheme } from '@/theme';

import { AppText } from './AppText';
import { IconBadge } from './IconBadge';

interface ListRowProps {
  title: string;
  body?: string;
  icon?: LucideIcon;
  iconTone?: 'primary' | 'danger' | 'success' | 'warning';
  onPress?: () => void;
  right?: ReactNode;
  destructive?: boolean;
  accessibilityHint?: string;
}

export function ListRow({ title, body, icon, iconTone, onPress, right, destructive, accessibilityHint }: ListRowProps) {
  const { colors } = useTheme();
  const content = (
    <>
      {icon ? <IconBadge icon={icon} size={40} tone={destructive ? 'danger' : iconTone} /> : null}
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
      {right ?? (onPress ? <ChevronRight size={20} color={colors.textMuted} /> : null)}
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
  const { colors } = useTheme();
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
      <Switch
        accessibilityLabel={title}
        accessibilityHint={body}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

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
  const { colors } = useTheme();
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
            borderColor: checked ? colors.primary : colors.border,
            backgroundColor: checked ? colors.primary : 'transparent',
          },
        ]}
      >
        {checked ? <Check size={16} color={colors.onPrimary} strokeWidth={3} /> : null}
      </View>
      <View style={styles.flex}>
        <AppText
          variant="bodyStrong"
          tone={checked ? 'textMuted' : 'text'}
          style={checked ? { textDecorationLine: 'line-through' } : undefined}
        >
          {label}
        </AppText>
        {detail ? (
          <AppText variant="caption" tone="textMuted" style={{ marginTop: 2 }}>
            {detail}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return (
    <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.xs }} />
  );
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <AppText
      variant="label"
      tone="textMuted"
      accessibilityRole="header"
      style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}
    >
      {children}
    </AppText>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <AppText
        variant="caption"
        style={{ fontFamily: 'Inter_600SemiBold', color: selected ? colors.onPrimary : colors.text }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

/** Selector segmentado (p. ej. tema claro/oscuro). */
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
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={[styles.segment, { backgroundColor: colors.surfaceAlt }]}
    >
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
              selected && {
                backgroundColor: colors.surface,
                shadowColor: colors.shadow,
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 1,
              },
            ]}
          >
            <AppText
              variant="caption"
              style={{ fontFamily: 'Inter_600SemiBold', color: selected ? colors.primary : colors.textMuted }}
            >
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
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: { flexDirection: 'row', borderRadius: radius.md, padding: 4, gap: 4 },
  segmentItem: {
    flex: 1,
    minHeight: MIN_TOUCH - 4,
    borderRadius: radius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
});
