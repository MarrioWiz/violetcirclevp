import { BarChart3 } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { IconBadge } from '@/components/IconBadge';
import { ToggleRow } from '@/components/Rows';
import { ScopeNotice } from '@/components/ScopeNotice';
import { OnboardingFrame } from '@/features/onboarding/OnboardingFrame';
import { S } from '@/lib/strings.es';
import { useSession } from '@/store/sessionStore';
import { DISCLAIMER_VERSION, useSettings } from '@/store/settingsStore';
import { spacing } from '@/theme';

export default function StatsStep() {
  const update = useSettings((s) => s.update);
  const unlock = useSession((s) => s.unlock);
  const [optIn, setOptIn] = useState(false);
  const [busy, setBusy] = useState(false);

  const finish = async () => {
    setBusy(true);
    // Al marcar onboarded, las rutas protegidas cambian solas a la app principal.
    unlock();
    await update({
      statsOptIn: optIn,
      onboarded: true,
      consentAt: new Date().toISOString(),
      disclaimerVersion: DISCLAIMER_VERSION,
    });
  };

  return (
    <OnboardingFrame
      step={5}
      footer={<Button label={S.onboarding.finish} size="lg" loading={busy} onPress={() => void finish()} />}
    >
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <IconBadge icon={BarChart3} size={80} />
        <AppText variant="title" center accessibilityRole="header">
          {S.onboarding.statsTitle}
        </AppText>
        <AppText tone="textMuted" center>
          {S.onboarding.statsBody}
        </AppText>
      </View>
      <Card>
        <ToggleRow title={S.onboarding.statsToggle} value={optIn} onChange={setOptIn} />
        {!optIn && (
          <AppText variant="caption" tone="textMuted">
            {S.onboarding.statsOff}
          </AppText>
        )}
      </Card>
      <ScopeNotice />
    </OnboardingFrame>
  );
}
