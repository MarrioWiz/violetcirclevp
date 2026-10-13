import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ArrowRight, FileQuestion, Lightbulb, NotebookPen, PartyPopper, RotateCcw, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { IconBadge } from '@/components/IconBadge';
import { Screen } from '@/components/Screen';
import { S, t } from '@/lib/strings.es';
import { useContent } from '@/store/contentStore';
import { alpha, fonts, palette, radius, spacing, useTheme } from '@/theme';

/**
 * Guía como tutorial: un paso por pantalla, con número grande, barra de avance y
 * Anterior / Siguiente. No hay nada que marcar ni tachar; al final, un cierre con consejos.
 */
export default function GuideDetail() {
  const { accent } = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const guide = useContent((s) => s.guides.find((g) => g.slug === slug));
  const [i, setI] = useState(0);

  if (!guide) {
    return (
      <Screen nav="back">
        <EmptyState icon={FileQuestion} title={S.guides.notFound} />
      </Screen>
    );
  }

  // Todos los pasos en orden, recordando a qué parte de la guía pertenece cada uno.
  const steps = guide.sections.flatMap((sec) => sec.items.map((item) => ({ ...item, section: sec.heading })));
  const total = steps.length;
  const done = i >= total;
  const step = steps[Math.min(i, total - 1)];
  const isEvidence = guide.slug === 'conservar-evidencia';

  const footer = done ? undefined : (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      <Button
        label={S.guides.prev}
        icon={ArrowLeft}
        variant="secondary"
        disabled={i === 0}
        onPress={() => setI((n) => Math.max(0, n - 1))}
        style={{ flex: 1 }}
      />
      <Button
        label={i === total - 1 ? S.guides.finish : S.guides.next}
        icon={i === total - 1 ? undefined : ArrowRight}
        onPress={() => setI((n) => n + 1)}
        style={{ flex: 1.4 }}
      />
    </View>
  );

  return (
    <Screen nav="back" title={guide.title} footer={footer} largeTitle={false}>
      {/* Barra de avance por segmentos */}
      <View style={styles.segments} accessible accessibilityLabel={t(S.guides.stepOf, { n: Math.min(i + 1, total), total })}>
        {steps.map((s, n) => (
          <View key={s.id} style={[styles.segment, { backgroundColor: n <= i ? accent : palette.glassStrong }]} />
        ))}
      </View>

      {done ? (
        <Animated.View entering={FadeIn.duration(250)} style={{ gap: spacing.lg, marginTop: spacing.xl }}>
          <Card tone="success">
            <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md }}>
              <IconBadge icon={PartyPopper} size={64} tone="success" />
              <AppText variant="title" center>
                {S.guides.finishedTitle}
              </AppText>
              <AppText tone="textMuted" center>
                {t(S.guides.finishedBody, { n: total })}
              </AppText>
            </View>
          </Card>

          {guide.tips?.length ? (
            <Card>
              <AppText variant="heading" style={{ marginBottom: spacing.md }}>
                {S.guides.tipsTitle}
              </AppText>
              <View style={{ gap: spacing.md }}>
                {guide.tips.map((tip) => (
                  <View key={tip} style={{ flexDirection: 'row', gap: spacing.md }}>
                    <Lightbulb size={18} color={palette.warning} style={{ marginTop: 3 }} />
                    <AppText style={{ flex: 1 }}>{tip}</AppText>
                  </View>
                ))}
              </View>
            </Card>
          ) : null}

          {isEvidence && (
            <Button label={S.guides.saveRecord} icon={NotebookPen} size="lg" onPress={() => router.push('/bitacora/nueva')} />
          )}
          <Button label={S.guides.askVi} icon={Sparkles} variant="secondary" onPress={() => router.push('/asistente')} />
          <Button label={S.guides.again} icon={RotateCcw} variant="ghost" onPress={() => setI(0)} />
        </Animated.View>
      ) : (
        <Animated.View key={step.id} entering={FadeIn.duration(220)} style={{ marginTop: spacing.xl, gap: spacing.lg }}>
          <AppText variant="label" style={{ color: accent }}>
            {t(S.guides.stepOf, { n: i + 1, total })} · {step.section}
          </AppText>

          <View style={[styles.stepCard, { backgroundColor: alpha(accent, 0.12) }]}>
            <View style={[styles.bigNum, { backgroundColor: accent }]}>
              <AppText style={styles.bigNumText}>{i + 1}</AppText>
            </View>
            <AppText variant="title" accessibilityRole="header">
              {step.text}
            </AppText>
            {step.detail ? <AppText style={{ color: 'rgba(255,255,255,0.8)' }}>{step.detail}</AppText> : null}
          </View>

          {i === 0 && guide.summary ? (
            <AppText tone="textMuted">{guide.summary}</AppText>
          ) : null}

          <AppText variant="caption" tone="textMuted">
            {t(S.guides.lastReviewed, { date: guide.lastReviewed })}
          </AppText>
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  segments: { flexDirection: 'row', gap: 4 },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  stepCard: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.lg },
  bigNum: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  bigNumText: { color: palette.white, fontFamily: fonts.display, fontSize: 24, lineHeight: 28 },
});
