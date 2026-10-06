import { router, useLocalSearchParams } from 'expo-router';
import { NotebookPen, Phone, Users, Wind, type LucideIcon } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { IconBadge } from '@/components/IconBadge';
import { Screen } from '@/components/Screen';
import { BreathingCircle } from '@/features/alert/BreathingCircle';
import { CircleComposer } from '@/features/circle/CircleComposer';
import { call911 } from '@/features/emergency/call';
import { S } from '@/lib/strings.es';
import { useIncidents } from '@/store/incidentsStore';
import { spacing } from '@/theme';

function Option({
  icon,
  title,
  body,
  onPress,
  tone = 'primary',
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  onPress: () => void;
  tone?: 'primary' | 'danger';
}) {
  return (
    <Card onPress={onPress} accessibilityLabel={`${title}. ${body}`} tone={tone === 'danger' ? 'danger' : 'surface'} style={{ minHeight: 96, justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
        <IconBadge icon={icon} size={52} tone={tone} />
        <View style={{ flex: 1 }}>
          <AppText variant="heading" tone={tone === 'danger' ? 'danger' : 'text'}>
            {title}
          </AppText>
          <AppText variant="caption" tone="textMuted">
            {body}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

export default function QuickAlert() {
  // Desde "Mi círculo" se puede llegar directo al mensaje para una persona.
  const { to } = useLocalSearchParams<{ to?: string }>();
  const [stage, setStage] = useState<'choose' | 'compose'>(to ? 'compose' : 'choose');
  const [breathing, setBreathing] = useState(false);
  const logAlert = useIncidents((s) => s.logAlert);
  const logged = useRef(false);

  // Se registra solo en la bitácora local, una vez por uso. Nada sale a la nube.
  const log = (what: string) => {
    if (logged.current) return;
    logged.current = true;
    void logAlert(what);
  };

  if (stage === 'compose') {
    return (
      <Screen nav="close" title={S.alert.composeTitle} edges={['top', 'bottom']}>
        <CircleComposer
          preselectId={to}
          onOpened={(ch) => !to && log(ch === 'sms' ? 'Abrí Mensajes para avisar a mi círculo.' : 'Abrí WhatsApp para avisar a mi círculo.')}
        />
      </Screen>
    );
  }

  return (
    <Screen nav="close" edges={['top', 'bottom']}>
      <View style={{ alignItems: 'center', gap: spacing.xs, marginBottom: spacing.lg }}>
        <AppText variant="title" center accessibilityRole="header">
          {S.alert.title}
        </AppText>
        <AppText tone="textMuted" center>
          {S.triage.notYourFault}
        </AppText>
      </View>

      {breathing ? (
        <View>
          <BreathingCircle />
          <Button label={S.alert.skipBreath} variant="ghost" onPress={() => setBreathing(false)} />
        </View>
      ) : (
        <Button label={S.alert.breathe} icon={Wind} variant="ghost" onPress={() => setBreathing(true)} />
      )}

      <AppText variant="label" tone="textMuted" style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        {S.alert.question}
      </AppText>

      <View style={{ gap: spacing.md }}>
        <Option icon={Users} title={S.alert.notifyCircle} body={S.alert.notifyCircleBody} onPress={() => setStage('compose')} />
        <Option
          icon={Phone}
          tone="danger"
          title={S.emergency.call911}
          body={S.alert.call911Body}
          onPress={() => {
            log('Abrí la opción de llamar al 911.');
            void call911();
          }}
        />
        <Option
          icon={NotebookPen}
          title={S.alert.saveWhat}
          body={S.alert.saveWhatBody}
          onPress={() => {
            logged.current = true; // la nueva entrada ya deja registro
            router.replace('/bitacora/nueva');
          }}
        />
      </View>
    </Screen>
  );
}
