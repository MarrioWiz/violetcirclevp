import { router } from 'expo-router';
import { BookOpen, LifeBuoy, Phone, ShieldCheck, Users } from 'lucide-react-native';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Expandable } from '@/components/Expandable';
import { ListRow } from '@/components/Rows';
import { call911 } from '@/features/emergency/call';
import { S, t } from '@/lib/strings.es';
import { spacing, useTheme } from '@/theme';

import type { ResolvedResult } from './engine';

const PLATFORM_NAMES: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  otra: 'correo u otras apps',
};

export function UrgentBlock() {
  const { colors } = useTheme();
  return (
    <Card tone="danger" accessibilityLabel={`${S.triage.urgentTitle}. ${S.triage.urgentBody}`}>
      <View style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
          <Phone size={22} color={colors.danger} />
          <AppText variant="heading" tone="danger">
            {S.triage.urgentTitle}
          </AppText>
        </View>
        <AppText>{S.triage.urgentBody}</AppText>
        <Button label={S.emergency.call911} variant="danger" icon={Phone} size="lg" onPress={() => void call911()} />
        <Button label={S.triage.goCircle} variant="outline" icon={Users} onPress={() => router.push('/alerta')} />
      </View>
    </Card>
  );
}

function NumberedList({ items, color }: { items: string[]; color: string }) {
  return (
    <View style={{ gap: spacing.md }}>
      {items.map((it, i) => (
        <View key={it} style={{ flexDirection: 'row', gap: spacing.md }}>
          <AppText variant="mono" style={{ color, marginTop: 3 }} accessibilityElementsHidden>
            {String(i + 1).padStart(2, '0')}
          </AppText>
          <AppText style={{ flex: 1 }}>{it}</AppText>
        </View>
      ))}
    </View>
  );
}

export function ResultView({ resolved }: { resolved: ResolvedResult }) {
  const { colors } = useTheme();
  const { result, extras, platform } = resolved;

  return (
    <View style={{ gap: spacing.lg }}>
      {result.urgent && <UrgentBlock />}

      <Card tone="accent">
        <AppText variant="caption" tone="textMuted">
          {S.triage.resultLead}
        </AppText>
        <AppText variant="title" accent accessibilityRole="header" style={{ marginTop: spacing.xs }}>
          {result.title}
        </AppText>
        <AppText style={{ marginTop: spacing.sm }}>{result.explanation}</AppText>
        <AppText variant="bodyStrong" style={{ marginTop: spacing.md }}>
          {S.triage.notYourFault}
        </AppText>
      </Card>

      {extras.map((e) => (
        <Card key={e}>
          <AppText>{e}</AppText>
        </Card>
      ))}

      <Card>
        <AppText variant="heading" accessibilityRole="header" style={{ marginBottom: spacing.md }}>
          {S.triage.doNow}
        </AppText>
        <NumberedList items={result.doNow} color={colors.success} />
      </Card>

      <Expandable title={S.triage.dontDo} summary={result.dontDo[0]}>
        <NumberedList items={result.dontDo} color={colors.warning} />
      </Expandable>

      <Button label={S.triage.goEvidence} icon={ShieldCheck} onPress={() => router.push('/guia/conservar-evidencia')} />

      <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
        {platform ? (
          <ListRow
            icon={BookOpen}
            title={t(S.triage.goPlatform, { platform: PLATFORM_NAMES[platform] ?? platform })}
            onPress={() => router.push({ pathname: '/guia/[slug]', params: { slug: `plataforma-${platform}` } })}
          />
        ) : null}
        <ListRow icon={LifeBuoy} title={S.triage.goDirectory} onPress={() => router.push('/directorio')} />
        {!result.urgent && (
          <ListRow icon={Users} title={S.triage.goCircle} onPress={() => router.push('/alerta')} />
        )}
      </Card>

      <AppText variant="caption" tone="textMuted">
        {S.triage.disclaimer}
      </AppText>
    </View>
  );
}
