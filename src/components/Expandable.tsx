import { ChevronDown, type LucideIcon } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { HAIRLINE, MIN_TOUCH, palette, radius, spacing, useTheme } from '@/theme';

import { AppText } from './AppText';
import { IconBadge } from './IconBadge';

interface Props {
  title: string;
  /** Una línea bajo el título (resumen de lo que hay dentro). */
  summary?: string;
  icon?: LucideIcon;
  defaultOpen?: boolean;
  children: ReactNode;
}

/** Sección de vidrio que se abre al tocar: para lo secundario que no debe saturar la pantalla. */
export function Expandable({ title, summary, icon, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const { colors } = useTheme();
  return (
    <View style={styles.box}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={summary ? `${title}. ${summary}` : title}
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => [styles.head, { opacity: pressed ? 0.75 : 1 }]}
      >
        {icon ? <IconBadge icon={icon} size={36} /> : null}
        <View style={{ flex: 1 }}>
          <AppText variant="bodyStrong">{title}</AppText>
          {summary && !open ? (
            <AppText variant="caption" tone="textMuted" numberOfLines={1}>
              {summary}
            </AppText>
          ) : null}
        </View>
        <ChevronDown
          size={18}
          color={colors.textMuted}
          strokeWidth={1.75}
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {open ? (
        <Animated.View entering={FadeIn.duration(180)} style={styles.body}>
          {children}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.lg,
    borderWidth: HAIRLINE,
    borderColor: palette.stroke,
    backgroundColor: palette.glass,
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: MIN_TOUCH + 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
});
