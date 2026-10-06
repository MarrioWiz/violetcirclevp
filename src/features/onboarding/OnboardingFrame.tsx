import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HAIRLINE, MIN_TOUCH, alpha, palette, radius, spacing, useTheme } from '@/theme';
import { Backdrop } from '@/components/ui/Backdrop';

export const ONBOARDING_STEPS = 5;

interface Props {
  step: number;
  children: ReactNode;
  footer: ReactNode;
  canGoBack?: boolean;
}

export function OnboardingFrame({ step, children, footer, canGoBack = true }: Props) {
  const { colors, accent } = useTheme();
  return (
    <View style={styles.flex}>
      <Backdrop />
      <SafeAreaView edges={['top', 'bottom']} style={styles.flex}>
        <View style={styles.top}>
          {canGoBack && router.canGoBack() ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Regresar"
              onPress={() => router.back()}
              style={[styles.back, styles.backBtn]}
            >
              <ChevronLeft size={20} color={colors.text} strokeWidth={1.9} />
            </Pressable>
          ) : (
            <View style={styles.back} />
          )}
          <View style={styles.progress} accessible accessibilityLabel={`Paso ${step} de ${ONBOARDING_STEPS}`}>
            {Array.from({ length: ONBOARDING_STEPS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === step - 1
                    ? { width: 28, backgroundColor: accent }
                    : { backgroundColor: i < step ? alpha(accent, 0.5) : palette.strokeStrong },
                ]}
              />
            ))}
          </View>
          <View style={styles.back} />
        </View>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          <View style={styles.footer}>{footer}</View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  back: {
    width: MIN_TOUCH - 4,
    height: MIN_TOUCH - 4,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: { flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: radius.pill },
  backBtn: {
    borderRadius: radius.pill,
    backgroundColor: palette.glassStrong,
    borderWidth: HAIRLINE,
    borderColor: palette.strokeStrong,
  },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl, gap: spacing.lg },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md, paddingTop: spacing.sm, gap: spacing.sm },
});
