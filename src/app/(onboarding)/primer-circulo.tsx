import { router } from 'expo-router';
import { Users, UserCheck } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { IconBadge } from '@/components/IconBadge';
import { ContactFormView } from '@/features/circle/ContactFormView';
import { OnboardingFrame } from '@/features/onboarding/OnboardingFrame';
import { notify } from '@/lib/dialog';
import { S } from '@/lib/strings.es';
import { MAX_CONTACTS, useCircle } from '@/store/circleStore';
import { spacing } from '@/theme';

export default function CircleStep() {
  const contacts = useCircle((s) => s.contacts);
  const add = useCircle((s) => s.add);
  const [adding, setAdding] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!useCircle.getState().hydrated) void useCircle.getState().hydrate();
  }, []);

  return (
    <OnboardingFrame
      step={4}
      canGoBack={false}
      footer={
        <Button
          label={contacts.length ? S.common.continue : S.common.later}
          size="lg"
          variant={contacts.length ? 'primary' : 'secondary'}
          onPress={() => router.push('/estadisticas')}
        />
      }
    >
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <IconBadge icon={Users} size={80} />
        <AppText variant="title" center accessibilityRole="header">
          {S.onboarding.circleTitle}
        </AppText>
        <AppText tone="textMuted" center>
          {S.onboarding.circleBody}
        </AppText>
        <AppText variant="caption" tone="primary" center>
          {S.circle.localOnly}
        </AppText>
      </View>

      {contacts.map((c) => (
        <Card key={c.id} tone="soft">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <UserCheck size={20} color="#6D28D9" />
            <AppText variant="bodyStrong">{c.name}</AppText>
          </View>
        </Card>
      ))}

      {adding ? (
        <Card>
          <ContactFormView
            key={formKey}
            submitLabel={S.common.save}
            onSubmit={async (data) => {
              try {
                await add(data);
                setFormKey((k) => k + 1);
                setAdding(false);
              } catch {
                notify(S.circle.full);
              }
            }}
          />
        </Card>
      ) : contacts.length < Math.min(3, MAX_CONTACTS) ? (
        <Button label={contacts.length ? S.circle.add : S.onboarding.circleAdd} variant="outline" onPress={() => setAdding(true)} />
      ) : null}
    </OnboardingFrame>
  );
}
