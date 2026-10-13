import { useMemo } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { Screen } from '@/components/Screen';
import { tabMeta } from '@/components/dock/tabs';
import { HoldToHelpOrb } from '@/features/sos/HoldToHelpOrb';
import { ReadinessRow } from '@/features/sos/ReadinessRow';
import { S } from '@/lib/strings.es';
import { spacing } from '@/theme';

/**
 * Inicio: UNA acción (el orbe "Pedir ayuda"). Debajo, solo si la ayuda está lista o qué falta,
 * y al final la franja del 911. Todo lo demás vive en su pestaña del dock.
 */
export default function Home() {
  const meta = tabMeta('index');
  const greeting = useMemo(() => S.home.greeting[new Date().getDate() % S.home.greeting.length], []);

  return (
    <Screen
      dock
      title={meta.title}
      subtitle={meta.subtitle}
      eyebrow={greeting}
      footer={
        <View style={{ gap: spacing.md }}>
          <EmergencyBanner />
          <AppText variant="caption" tone="textMuted" center>
            {S.home.scopeLine}
          </AppText>
        </View>
      }
    >
      {/* Tocar = opciones de ayuda; mantener 2 s = SMS con ubicación. */}
      <View style={{ paddingVertical: spacing.lg }}>
        <HoldToHelpOrb />
      </View>
      <ReadinessRow />
    </Screen>
  );
}
