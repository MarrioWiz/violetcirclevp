import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MIN_TOUCH, spacing, useTheme } from '@/theme';

export const ONBOARDING_STEPS = 5;

interface Props {
  step: number;
  children: ReactNode;
  footer: ReactNode;
  canGoBack?: boolean;
}

export function OnboardingFrame({ step, children, footer, canGoBack = true }: Props) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.flex, { backgroundColor: colors.bg }]}>
      <View style={styles.top}>
        {canGoBack && router.canGoBack() ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Regresar"
            onPress={() => router.back()}
            style={[styles.back, { backgroundColor: colors.surfaceAlt }]}
          >
            <ChevronLeft size={22} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.back} />
        )}
        <View style={styles.progress} accessible accessibilityLabel={`Paso ${step} de ${ONBOARDING_STEPS}`}>
          {Array.from({ length: ONBOARDING_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.bar,
                { backgroundColor: i < step ? colors.primary : colors.border, flex: i === step - 1 ? 2 : 1 },
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
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: { flex: 1, flexDirection: 'row', gap: 6 },
  bar: { height: 6, borderRadius: 3 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl, gap: spacing.lg },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md, paddingTop: spacing.sm, gap: spacing.sm },
});
