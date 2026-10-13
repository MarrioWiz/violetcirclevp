import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { QuickExitGuide } from '@/features/auth/QuickExitGuide';
import { OnboardingFrame } from '@/features/onboarding/OnboardingFrame';
import { S } from '@/lib/strings.es';
import { useSettings } from '@/store/settingsStore';
import { spacing } from '@/theme';

/** Va justo después del PIN: la salida rápida depende de él para volver. */
export default function QuickExitStep() {
  const update = useSettings((s) => s.update);
  return (
    <OnboardingFrame
      step={5}
      canGoBack={false}
      footer={
        <Button
          label={S.quickExitGuide.gotIt}
          size="lg"
          onPress={() => {
            void update({ quickExitTipSeen: true });
            router.replace('/primer-circulo');
          }}
        />
      }
    >
      <View style={{ gap: spacing.sm }}>
        <AppText variant="label" tone="textMuted">
          {S.quickExitGuide.eyebrow}
        </AppText>
        <AppText variant="hero" accessibilityRole="header">
          {S.quickExitGuide.title}
        </AppText>
        <AppText tone="textMuted">{S.quickExitGuide.subtitle}</AppText>
      </View>
      <QuickExitGuide />
    </OnboardingFrame>
  );
}
