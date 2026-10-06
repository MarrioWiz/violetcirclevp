import { router } from 'expo-router';
import { EyeOff, Lock, ShieldCheck, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { IconBadge } from '@/components/IconBadge';
import { CheckRow } from '@/components/Rows';
import { PrivacyNoticeBody } from '@/features/settings/PrivacyNoticeBody';
import { OnboardingFrame } from '@/features/onboarding/OnboardingFrame';
import { S } from '@/lib/strings.es';
import { spacing } from '@/theme';

const ICONS = [Lock, ShieldCheck, EyeOff, Trash2];

export default function PrivacyStep() {
  const [accepted, setAccepted] = useState(false);
  const [showFull, setShowFull] = useState(false);

  return (
    <OnboardingFrame
      step={2}
      footer={
        <>
          <CheckRow label={S.onboarding.consent} checked={accepted} onToggle={() => setAccepted((v) => !v)} />
          <Button label={S.common.continue} size="lg" disabled={!accepted} onPress={() => router.push('/crear-pin')} />
        </>
      }
    >
      <AppText variant="title" accessibilityRole="header">
        {S.onboarding.privacyTitle}
      </AppText>
      <View style={{ gap: spacing.md }}>
        {S.onboarding.privacyPoints.map((p, i) => (
          <Card key={p.title}>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <IconBadge icon={ICONS[i]} />
              <View style={{ flex: 1 }}>
                <AppText variant="subheading">{p.title}</AppText>
                <AppText tone="textMuted" variant="caption" style={{ marginTop: 2 }}>
                  {p.body}
                </AppText>
              </View>
            </View>
          </Card>
        ))}
      </View>
      <Button
        label={showFull ? S.common.close : S.onboarding.readFullPrivacy}
        variant="ghost"
        onPress={() => setShowFull((v) => !v)}
      />
      {showFull && <PrivacyNoticeBody />}
    </OnboardingFrame>
  );
}
