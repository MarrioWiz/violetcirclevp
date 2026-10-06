import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { Logo } from '@/components/Logo';
import { FileCard } from '@/components/ui/FileCard';
import { OnboardingFrame } from '@/features/onboarding/OnboardingFrame';
import { S } from '@/lib/strings.es';
import { palette, spacing, useTheme } from '@/theme';

const GLOW = 260;

export default function Welcome() {
  const { accent } = useTheme();
  return (
    <OnboardingFrame
      step={1}
      canGoBack={false}
      footer={<Button label={S.common.continue} size="lg" onPress={() => router.push('/consentimiento')} />}
    >
      <View style={styles.hero}>
        <Svg width={GLOW} height={GLOW} style={styles.glow} pointerEvents="none">
          <Defs>
            <RadialGradient id="welcome" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0" stopColor={palette.violet} stopOpacity={0.5} />
              <Stop offset="1" stopColor={palette.violet} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={GLOW / 2} cy={GLOW / 2} r={GLOW / 2} fill="url(#welcome)" />
        </Svg>
        <Logo size={120} />
      </View>

      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={[styles.dot, { backgroundColor: accent }]} />
          <AppText variant="label" tone="textMuted">
            {S.appName}
          </AppText>
        </View>
        <AppText
          variant="display"
          accessibilityRole="header"
          adjustsFontSizeToFit
          numberOfLines={3}
          minimumFontScale={0.6}
        >
          {S.onboarding.welcomeTitle}
        </AppText>
        <AppText variant="subtitle" tone="textMuted">
          {S.onboarding.welcomeBody}
        </AppText>
        <AppText variant="bodyStrong" accent>
          {S.onboarding.welcomeNotYourFault}
        </AppText>
      </View>

      <FileCard name="alcance.txt" meta="LEER">
        <AppText variant="subheading" style={{ marginBottom: spacing.sm }}>
          {S.scope.title}
        </AppText>
        <View style={{ gap: spacing.sm }}>
          {S.scope.points.map((p) => (
            <View key={p} style={{ flexDirection: 'row', gap: spacing.sm }}>
              <View style={[styles.bullet, { backgroundColor: accent }]} />
              <AppText style={{ flex: 1 }}>{p}</AppText>
            </View>
          ))}
        </View>
      </FileCard>

      <EmergencyBanner />
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  hero: { height: 200, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', left: '50%', marginLeft: -GLOW / 2, top: 100 - GLOW / 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 9 },
});
