import { router } from 'expo-router';
import { ScanFace } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { IconBadge } from '@/components/IconBadge';
import { PinSetup } from '@/features/auth/PinSetup';
import { OnboardingFrame } from '@/features/onboarding/OnboardingFrame';
import { notify } from '@/lib/dialog';
import { S, t } from '@/lib/strings.es';
import { authenticateBiometric, getBiometricInfo } from '@/services/biometrics';
import { savePin } from '@/services/crypto';
import { useSettings } from '@/store/settingsStore';
import { spacing } from '@/theme';

export default function PinStep() {
  const update = useSettings((s) => s.update);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [bio, setBio] = useState<string | null>(null);

  useEffect(() => {
    void getBiometricInfo().then((info) => {
      if (info.available) setBio(info.label);
    });
  }, []);

  const onPin = async (pin: string) => {
    setBusy(true);
    try {
      await savePin(pin);
      setSaved(true);
      if (!bio) router.replace('/salida-rapida');
    } catch {
      notify(S.errors.generic);
    } finally {
      setBusy(false);
    }
  };

  const enableBio = async () => {
    if (await authenticateBiometric(S.lock.biometricPrompt)) await update({ biometrics: true });
    router.replace('/salida-rapida');
  };

  if (saved && bio) {
    return (
      <OnboardingFrame
        step={4}
        canGoBack={false}
        footer={
          <>
            <Button
              label={t(S.onboarding.biometricsEnable, { method: bio })}
              size="lg"
              icon={ScanFace}
              onPress={() => void enableBio()}
            />
            <Button label={S.common.skip} variant="ghost" onPress={() => router.replace('/salida-rapida')} />
          </>
        }
      >
        <View style={{ alignItems: 'center', gap: spacing.lg, paddingTop: spacing.xxl }}>
          <IconBadge icon={ScanFace} size={88} />
          <AppText variant="title" center accessibilityRole="header">
            {t(S.onboarding.biometricsTitle, { method: bio })}
          </AppText>
          <AppText tone="textMuted" center>
            {S.onboarding.biometricsBody}
          </AppText>
        </View>
      </OnboardingFrame>
    );
  }

  return (
    <OnboardingFrame step={4} footer={null}>
      <PinSetup onDone={(p) => void onPin(p)} busy={busy} />
    </OnboardingFrame>
  );
}
