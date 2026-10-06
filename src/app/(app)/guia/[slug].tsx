import { useLocalSearchParams } from 'expo-router';
import { FileQuestion, Lightbulb } from 'lucide-react-native';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { IconBadge } from '@/components/IconBadge';
import { iconFor } from '@/components/icons';
import { CheckRow, Divider } from '@/components/Rows';
import { Screen } from '@/components/Screen';
import { S, t } from '@/lib/strings.es';
import { checklistKey, useChecklist } from '@/store/checklistStore';
import { useContent } from '@/store/contentStore';
import { radius, spacing, useTheme } from '@/theme';

export default function GuideDetail() {
  const { colors } = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const guide = useContent((s) => s.guides.find((g) => g.slug === slug));
  const done = useChecklist((s) => s.done);
  const toggle = useChecklist((s) => s.toggle);
  const resetGuide = useChecklist((s) => s.resetGuide);

  if (!guide) {
    return (
      <Screen nav="back">
        <EmptyState icon={FileQuestion} title={S.guides.notFound} />
      </Screen>
    );
  }

  const items = guide.sections.flatMap((s) => s.items);
  const completed = items.filter((i) => done[checklistKey(guide.slug, i.id)]).length;
  const pct = items.length ? completed / items.length : 0;

  return (
    <Screen nav="back">
      <View style={{ flexDirection: 'row', gap: spacing.lg, alignItems: 'center', marginBottom: spacing.lg }}>
        <IconBadge icon={iconFor(guide.icon)} size={56} />
        <View style={{ flex: 1 }}>
          <AppText variant="title" accessibilityRole="header">
            {guide.title}
          </AppText>
        </View>
      </View>
      <AppText tone="textMuted">{guide.summary}</AppText>

      <View
        style={{ marginTop: spacing.lg, gap: spacing.xs }}
        accessible
        accessibilityLabel={`Avance: ${t(S.guides.progress, { done: completed, total: items.length })}`}
      >
        <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' }}>
          <View
            style={{ height: 8, width: `${pct * 100}%`, backgroundColor: colors.primary, borderRadius: radius.pill }}
          />
        </View>
        <AppText variant="caption" tone="textMuted">
          {t(S.guides.progress, { done: completed, total: items.length })}
        </AppText>
      </View>

      {guide.sections.map((section) => (
        <Card key={section.heading} style={{ marginTop: spacing.lg }}>
          <AppText variant="heading" accessibilityRole="header">
            {section.heading}
          </AppText>
          {section.intro ? (
            <AppText tone="textMuted" style={{ marginTop: spacing.xs }}>
              {section.intro}
            </AppText>
          ) : null}
          <View style={{ marginTop: spacing.sm }}>
            {section.items.map((item, i) => (
              <View key={item.id}>
                {i > 0 && <Divider />}
                <CheckRow
                  label={item.text}
                  detail={item.detail}
                  checked={!!done[checklistKey(guide.slug, item.id)]}
                  onToggle={() => void toggle(guide.slug, item.id)}
                />
              </View>
            ))}
          </View>
        </Card>
      ))}

      {guide.tips?.map((tip) => (
        <Card key={tip} tone="soft" style={{ marginTop: spacing.lg }}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Lightbulb size={20} color={colors.primaryDark} />
            <AppText tone="primaryDark" style={{ flex: 1 }}>
              {tip}
            </AppText>
          </View>
        </Card>
      ))}

      <AppText variant="caption" tone="textMuted" style={{ marginTop: spacing.xl }}>
        {t(S.guides.lastReviewed, { date: guide.lastReviewed })}
        {guide.reviewStatus === 'borrador' ? ` · ${S.common.draftBadge}` : ''}
      </AppText>

      {completed > 0 && (
        <Button
          label={S.guides.reset}
          variant="ghost"
          onPress={() => void resetGuide(guide.slug)}
          style={{ marginTop: spacing.md }}
        />
      )}
    </Screen>
  );
}
