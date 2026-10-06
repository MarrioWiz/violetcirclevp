import * as Haptics from 'expo-haptics';
import { LogOut } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { S } from '@/lib/strings.es';
import { useSession } from '@/store/sessionStore';
import { HAIRLINE, palette, radius, spacing } from '@/theme';

import { AppText } from './AppText';

/** Píldora de vidrio, siempre arriba a la derecha. Un toque: oculta la app tras una calculadora. */
export function QuickExitButton({ compact }: { compact?: boolean }) {
  const quickExit = useSession((s) => s.quickExit);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={S.quickExit.label}
      accessibilityHint={S.quickExit.a11y}
      hitSlop={8}
      onPress={() => {
        if (Platform.OS !== 'web')
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
        void quickExit();
      }}
      style={({ pressed }) => [styles.pill, compact && styles.compact, { opacity: pressed ? 0.7 : 1 }]}
    >
      <LogOut size={16} color={palette.text} strokeWidth={1.9} />
      {!compact && (
        <AppText variant="label" style={{ color: palette.text, letterSpacing: 1 }}>
          {S.quickExit.label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 40,
    minWidth: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: palette.glassStrong,
    borderWidth: HAIRLINE,
    borderColor: palette.strokeStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  compact: { paddingHorizontal: 0, width: 40 },
});
