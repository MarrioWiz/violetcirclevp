import * as Haptics from 'expo-haptics';
import { EyeOff } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { S } from '@/lib/strings.es';
import { useSession } from '@/store/sessionStore';
import { MIN_TOUCH, radius, spacing, useTheme } from '@/theme';

import { AppText } from './AppText';

/** Un toque: oculta la app tras una calculadora y borra el historial de navegación. */
export function QuickExitButton({ compact }: { compact?: boolean }) {
  const { colors } = useTheme();
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
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: colors.surfaceAlt, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <EyeOff size={18} color={colors.text} strokeWidth={2} />
      {!compact && (
        <AppText variant="caption" style={{ fontFamily: 'Inter_600SemiBold' }}>
          {S.quickExit.label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: MIN_TOUCH - 4,
    minWidth: MIN_TOUCH - 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
