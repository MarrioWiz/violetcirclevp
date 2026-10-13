import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { tabMeta } from '@/components/dock/tabs';
import { Screen } from '@/components/Screen';
import { bundled } from '@/features/content/repository';
import { sendAnonymousStat } from '@/features/stats/sendStat';
import {
  answer,
  getNode,
  isResultNode,
  remainingQuestions,
  resolveResult,
  type ResolvedResult,
  type TriageStep,
} from '@/features/triage/engine';
import { ResultView, UrgentBlock } from '@/features/triage/ResultView';
import { S, t } from '@/lib/strings.es';
import { HAIRLINE, MIN_TOUCH, alpha, palette, radius, spacing, useTheme } from '@/theme';
import type { TriageOption } from '@/types';

const tree = bundled.triage;
const START: TriageStep = { nodeId: tree.start, context: {} };

/**
 * Orienta: una pregunta por pantalla, en tarjetas, con barra de progreso.
 * (El único chat de la app es el asistente Vi.)
 */
export default function Triage() {
  const { accent, colors } = useTheme();
  const meta = tabMeta('orientacion');
  // Historial de pasos para poder regresar a la pregunta anterior.
  const [history, setHistory] = useState<TriageStep[]>([START]);
  const [resolved, setResolved] = useState<ResolvedResult | null>(null);

  const step = history[history.length - 1];
  const node = useMemo(() => getNode(tree, step.nodeId), [step.nodeId]);
  const answered = history.length - 1;
  const progress = resolved ? 1 : answered / (answered + Math.max(1, remainingQuestions(tree, step.nodeId)));

  const choose = (opt: TriageOption) => {
    const next = answer(step, opt);
    const nextNode = getNode(tree, next.nodeId);
    setHistory((h) => [...h, next]);
    if (isResultNode(nextNode)) {
      const r = resolveResult(tree, nextNode, next.context);
      setResolved(r);
      void sendAnonymousStat(r.result.kind, r.platform);
    }
  };

  const back = () => {
    setResolved(null);
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  };

  const restart = () => {
    setResolved(null);
    setHistory([START]);
  };

  const restartBtn =
    answered > 0 ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={S.triage.restart}
        onPress={restart}
        hitSlop={6}
        style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
      >
        <RotateCcw size={18} color={colors.text} strokeWidth={1.75} />
      </Pressable>
    ) : null;

  return (
    <Screen dock title={meta.title} subtitle={meta.subtitle} eyebrow={S.triage.title} headerRight={restartBtn}>
      {/* Progreso */}
      <View style={styles.progressRow}>
        <AppText variant="label" tone="textMuted">
          {resolved ? S.triage.result : t(S.triage.step, { n: answered + 1 })}
        </AppText>
        {answered > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={S.triage.previous}
            onPress={back}
            hitSlop={8}
            style={({ pressed }) => [styles.backLink, { opacity: pressed ? 0.6 : 1 }]}
          >
            <ChevronLeft size={16} color={accent} strokeWidth={2} />
            <AppText variant="caption" style={{ color: accent }}>
              {S.triage.previous}
            </AppText>
          </Pressable>
        )}
      </View>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      >
        <View style={[styles.fill, { width: `${Math.max(4, progress * 100)}%`, backgroundColor: accent }]} />
      </View>

      {resolved ? (
        <Animated.View entering={FadeInDown.duration(300)} style={{ marginTop: spacing.xl }}>
          <ResultView resolved={resolved} />
        </Animated.View>
      ) : !isResultNode(node) ? (
        <Animated.View key={node.id} entering={FadeIn.duration(220)} style={{ marginTop: spacing.xl, gap: spacing.lg }}>
          <View style={{ gap: spacing.sm }}>
            <AppText variant="title" accessibilityRole="header">
              {node.question}
            </AppText>
            {node.help ? <AppText tone="textMuted">{node.help}</AppText> : null}
          </View>

          <View style={{ gap: spacing.sm }}>
            {node.options.map((o) => (
              <Pressable
                key={o.label}
                accessibilityRole="button"
                accessibilityLabel={o.label}
                onPress={() => choose(o)}
                style={({ pressed }) => [
                  styles.option,
                  pressed && { backgroundColor: alpha(accent, 0.14), borderColor: alpha(accent, 0.5) },
                ]}
              >
                <AppText variant="bodyStrong" style={{ flex: 1 }}>
                  {o.label}
                </AppText>
                <ChevronRight size={18} color={colors.textMuted} strokeWidth={1.75} />
              </Pressable>
            ))}
          </View>

          {step.context.unsure === 'si' && node.id === 'q_platform' ? <UrgentBlock /> : null}

          {answered === 0 && (
            <AppText variant="caption" tone="textMuted">
              {S.triage.privateNote}
            </AppText>
          )}
        </Animated.View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.glassStrong,
    borderWidth: HAIRLINE,
    borderColor: palette.strokeStrong,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 24 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.glassStrong,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  fill: { height: 4, borderRadius: 2 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: MIN_TOUCH + 8,
    borderRadius: radius.lg,
    borderWidth: HAIRLINE,
    borderColor: palette.strokeStrong,
    backgroundColor: palette.glassStrong,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
