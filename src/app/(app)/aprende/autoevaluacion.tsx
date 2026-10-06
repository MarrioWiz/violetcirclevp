import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CheckRow, Divider, SectionTitle } from '@/components/Rows';
import { Screen } from '@/components/Screen';
import { auditLevel } from '@/features/content/audit';
import { bundled } from '@/features/content/repository';
import { S } from '@/lib/strings.es';
import { checklistKey, useChecklist } from '@/store/checklistStore';
import { spacing, useTheme } from '@/theme';

const AUDIT = bundled.audit;
const SLUG = 'autoevaluacion';

export default function SelfAudit() {
  const { colors } = useTheme();
  const done = useChecklist((s) => s.done);
  const toggle = useChecklist((s) => s.toggle);
  const checked = AUDIT.items.filter((i) => done[checklistKey(SLUG, i.id)]).length;
  const level = auditLevel(AUDIT.levels, checked);
  const pending = AUDIT.items.filter((i) => !done[checklistKey(SLUG, i.id)]);

  return (
    <Screen nav="back" title={AUDIT.title} subtitle={AUDIT.intro}>
      <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
        {AUDIT.items.map((item, i) => (
          <View key={item.id}>
            {i > 0 && <Divider />}
            <CheckRow label={item.text} checked={!!done[checklistKey(SLUG, item.id)]} onToggle={() => void toggle(SLUG, item.id)} />
          </View>
        ))}
      </Card>

      <SectionTitle>{S.learn.auditResult}</SectionTitle>
      <Card tone="soft" accessibilityLabel={`${level.title}. ${level.body}`}>
        <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
          <Sparkles size={22} color={colors.primaryDark} />
          <AppText variant="heading" tone="primaryDark">
            {level.title}
          </AppText>
        </View>
        <AppText tone="primaryDark" style={{ marginTop: spacing.sm }}>
          {level.body}
        </AppText>
      </Card>

      {pending.length > 0 && (
        <>
          <SectionTitle>{S.learn.auditPending}</SectionTitle>
          <Button label={S.guides.title} variant="secondary" onPress={() => router.push('/guia/seguridad-cuentas')} />
        </>
      )}
    </Screen>
  );
}
