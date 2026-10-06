import { Info } from 'lucide-react-native';
import { View } from 'react-native';

import { S } from '@/lib/strings.es';
import { spacing, useTheme } from '@/theme';

import { AppText } from './AppText';
import { Card } from './Card';

/** Aviso de alcance: obligatorio en onboarding, Inicio y Ajustes. */
export function ScopeNotice({ full }: { full?: boolean }) {
  const { colors } = useTheme();
  return (
    <Card tone="soft" accessibilityLabel={S.scope.short}>
      <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
        <Info size={20} color={colors.primaryDark} strokeWidth={2} style={{ marginTop: 2 }} />
        <View style={{ flex: 1, gap: spacing.sm }}>
          {full ? (
            S.scope.points.map((p) => (
              <AppText key={p} variant="caption" tone="primaryDark">
                • {p}
              </AppText>
            ))
          ) : (
            <AppText variant="caption" tone="primaryDark">
              {S.scope.short} Esta app no sustituye una denuncia formal ni la atención profesional.
            </AppText>
          )}
        </View>
      </View>
    </Card>
  );
}
