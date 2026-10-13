import { router, useLocalSearchParams } from 'expo-router';
import { Check, FileQuestion, Lightbulb, PartyPopper } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { IconBadge } from '@/components/IconBadge';
import { Screen } from '@/components/Screen';
import { S, t } from '@/lib/strings.es';
import { checklistKey, useChecklist } from '@/store/checklistStore';
import { useContent } from '@/store/contentStore';
import { HAIRLINE, MIN_TOUCH, alpha, fonts, palette, radius, spacing, useTheme } from '@/theme';

/** Un paso de la guía: número en un círculo que se vuelve palomita al marcarlo. Nada se tacha. */
function StepRow({
  n,
  text,
  detail,
  done,
  onToggle,
}: {
  n: number;
  text: string;
  detail?: string;
  done: boolean;
  onToggle: () => void;
}) {
  const { accent } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={detail ? `Paso ${n}. ${text}. ${detail}` : `Paso ${n}. ${text}`}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.step,
        done && { backgroundColor: alpha(palette.success, 0.07), borderColor: alpha(palette.success, 0.25) },
        { opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View
        style={[
          styles.num,
          done
            ? { backgroundColor: palette.success, borderColor: palette.success }
            : { borderColor: alpha(accent, 0.5), backgroundColor: alpha(accent, 0.12) },
        ]}
      >
        {done ? (
          <Check size={16} color={palette.bg0} strokeWidth={3} />
        ) : (
          <AppText variant="caption" style={{ color: accent, fontFamily: fonts.bold }}>
            {n}
          </AppText>
        )}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyStrong">{text}</AppText>
        {detail ? (
          <AppText variant="caption" tone="textMuted">
            {detail}
          </AppText>
        ) : null}
        <AppText variant="caption" style={{ color: done ? palette.success : accent, marginTop: 4, fontFamily: fonts.semi }}>
          {done ? S.guides.done : S.guides.markDone}
        </AppText>
      </View>
    </Pressable>
  );
}

export default function GuideDetail() {
  const { accent } = useTheme();
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
  const finished = items.length > 0 && completed === items.length;
  // Número de paso continuo entre secciones.
  const stepNo = new Map(items.map((it, i) => [it.id, i + 1]));

  return (
    <Screen nav="back" title={guide.title} subtitle={guide.summary}>
      {/* Avance */}
      <View
        style={{ gap: spacing.xs, marginBottom: spacing.lg }}
        accessible
        accessibilityLabel={`Avance: ${t(S.guides.progress, { done: completed, total: items.length })}`}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="label" tone="textMuted">
            {S.guides.progressLabel}
          </AppText>
          <AppText variant="caption" style={{ color: accent, fontFamily: fonts.semi }}>
            {t(S.guides.progress, { done: completed, total: items.length })}
          </AppText>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.max(pct * 100, 3)}%`, backgroundColor: accent }]} />
        </View>
      </View>

      {finished && (
        <Card tone="success" style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
            <IconBadge icon={PartyPopper} tone="success" />
            <View style={{ flex: 1 }}>
              <AppText variant="heading">{S.guides.doneAll}</AppText>
              <AppText variant="caption" tone="textMuted">
                {S.guides.doneAllBody}
              </AppText>
            </View>
          </View>
        </Card>
      )}

      {guide.sections.map((section) => (
        <View key={section.heading} style={{ marginBottom: spacing.xl, gap: spacing.sm }}>
          <AppText variant="heading" accessibilityRole="header">
            {section.heading}
          </AppText>
          {section.intro ? <AppText tone="textMuted">{section.intro}</AppText> : null}
          <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
            {section.items.map((item) => {
              return (
                <StepRow
                  key={item.id}
                  n={stepNo.get(item.id) ?? 0}
                  text={item.text}
                  detail={item.detail}
                  done={!!done[checklistKey(guide.slug, item.id)]}
                  onToggle={() => void toggle(guide.slug, item.id)}
                />
              );
            })}
          </View>
        </View>
      ))}

      {guide.tips?.map((tip) => (
        <Card key={tip} tone="soft" style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Lightbulb size={20} color={palette.violetLight} />
            <AppText style={{ flex: 1 }}>{tip}</AppText>
          </View>
        </Card>
      ))}

      <Button
        label={S.guides.askVi}
        variant="secondary"
        onPress={() => router.push('/asistente')}
        style={{ marginTop: spacing.md }}
      />

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

const styles = StyleSheet.create({
  track: { height: 6, borderRadius: radius.pill, backgroundColor: palette.glassStrong, overflow: 'hidden' },
  fill: { height: 6, borderRadius: radius.pill },
  step: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    minHeight: MIN_TOUCH,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: HAIRLINE,
    borderColor: palette.stroke,
    backgroundColor: palette.glass,
  },
  num: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
});
