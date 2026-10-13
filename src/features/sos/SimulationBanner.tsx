import { FlaskConical } from 'lucide-react-native';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { S } from '@/lib/strings.es';
import { palette, spacing } from '@/theme';

/** Aviso de que en web estas opciones son una simulación de la app de Android. */
export function SimulationBanner({ body = S.sos.simBody }: { body?: string }) {
  return (
    <Card tone="warning" style={{ marginBottom: spacing.sm }}>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <FlaskConical size={20} color={palette.warning} strokeWidth={1.9} />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="bodyStrong">{S.sos.simTitle}</AppText>
          <AppText variant="caption" tone="textMuted">
            {body}
          </AppText>
        </View>
      </View>
    </Card>
  );
}
