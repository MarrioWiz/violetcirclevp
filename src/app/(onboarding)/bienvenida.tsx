import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Phone } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Logo } from '@/components/Logo';
import { OnboardingFrame } from '@/features/onboarding/OnboardingFrame';
import { S } from '@/lib/strings.es';
import { radius, spacing, useTheme } from '@/theme';

export default function Welcome() {
  const { colors, scheme } = useTheme();
  return (
    <OnboardingFrame
      step={1}
      canGoBack={false}
      footer={<Button label={S.common.continue} size="lg" onPress={() => router.push('/consentimiento')} />}
    >
      <LinearGradient
        colors={scheme === 'dark' ? ['#2B2145', '#1E1830'] : ['#EDE9FE', '#FFFFFF']}
        style={styles.hero}
      >
        <Logo size={96} />
        <AppText variant="label" tone="primary" style={{ marginTop: spacing.lg }}>
          {S.appName}
        </AppText>
        <AppText variant="hero" center accessibilityRole="header" style={{ marginTop: spacing.sm }}>
          {S.onboarding.welcomeTitle}
        </AppText>
      </LinearGradient>

      <AppText tone="textMuted">{S.onboarding.welcomeBody}</AppText>
      <AppText variant="bodyStrong" tone="primary">
        {S.onboarding.welcomeNotYourFault}
      </AppText>

      <Card>
        <AppText variant="subheading" style={{ marginBottom: spacing.sm }}>
          {S.scope.title}
        </AppText>
        <View style={{ gap: spacing.sm }}>
          {S.scope.points.map((p) => (
            <View key={p} style={{ flexDirection: 'row', gap: spacing.sm }}>
              <View style={[styles.dot, { backgroundColor: colors.accent }]} />
              <AppText variant="body" style={{ flex: 1 }}>
                {p}
              </AppText>
            </View>
          ))}
        </View>
      </Card>

      <Card tone="danger">
        <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
          <Phone size={20} color={colors.danger} />
          <AppText variant="bodyStrong" tone="danger" style={{ flex: 1 }}>
            {S.emergency.banner}.
          </AppText>
        </View>
      </Card>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.xl, padding: spacing.xxl, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 8 },
});
