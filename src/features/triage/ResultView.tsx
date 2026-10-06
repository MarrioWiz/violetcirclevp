import { router } from 'expo-router';
import { Ban, BookOpen, CheckCircle2, LifeBuoy, Phone, ShieldCheck, Users } from 'lucide-react-native';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
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

function BulletList({ items, icon: Icon, color }: { items: string[]; icon: typeof CheckCircle2; color: string }) {
  return (
    <View style={{ gap: spacing.md }}>
      {items.map((it) => (
        <View key={it} style={{ flexDirection: 'row', gap: spacing.md }}>
          <Icon size={20} color={color} style={{ marginTop: 2 }} />
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

      <Card>
        <AppText variant="caption" tone="textMuted">
          {S.triage.resultLead}
        </AppText>
        <AppText variant="title" tone="primary" accessibilityRole="header" style={{ marginTop: spacing.xs }}>
          {result.title}
        </AppText>
        <AppText style={{ marginTop: spacing.sm }}>{result.explanation}</AppText>
        <AppText variant="bodyStrong" tone="primary" style={{ marginTop: spacing.md }}>
          {S.triage.notYourFault}
        </AppText>
      </Card>

      {extras.map((e) => (
        <Card key={e} tone="soft">
          <AppText tone="primaryDark">{e}</AppText>
        </Card>
      ))}

      <Card>
        <AppText variant="heading" accessibilityRole="header" style={{ marginBottom: spacing.md }}>
          {S.triage.doNow}
        </AppText>
        <BulletList items={result.doNow} icon={CheckCircle2} color={colors.success} />
      </Card>

      <Card>
        <AppText variant="heading" accessibilityRole="header" style={{ marginBottom: spacing.md }}>
          {S.triage.dontDo}
        </AppText>
        <BulletList items={result.dontDo} icon={Ban} color={colors.warning} />
      </Card>

      <AppText variant="label" tone="textMuted">
        {S.triage.next}
      </AppText>
      <View style={{ gap: spacing.sm }}>
        <Button
          label={S.triage.goEvidence}
          icon={ShieldCheck}
          variant="secondary"
          onPress={() => router.push('/guia/conservar-evidencia')}
        />
        {platform ? (
          <Button
            label={t(S.triage.goPlatform, { platform: PLATFORM_NAMES[platform] ?? platform })}
            icon={BookOpen}
            variant="secondary"
            onPress={() => router.push({ pathname: '/guia/[slug]', params: { slug: `plataforma-${platform}` } })}
          />
        ) : null}
        <Button
          label={S.triage.goDirectory}
          icon={LifeBuoy}
          variant="secondary"
          onPress={() => router.push('/directorio')}
        />
        {!result.urgent && (
          <Button label={S.triage.goCircle} icon={Users} variant="outline" onPress={() => router.push('/alerta')} />
        )}
      </View>

      <AppText variant="caption" tone="textMuted">
        {S.triage.disclaimer}
      </AppText>
    </View>
  );
}
