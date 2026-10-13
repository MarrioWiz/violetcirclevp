import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Compass,
  DoorOpen,
  Lock,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { tabMeta } from '@/components/dock/tabs';
import { IconBadge } from '@/components/IconBadge';
import { Screen } from '@/components/Screen';
import { bundled } from '@/features/content/repository';
import { PLATFORM_ICON } from '@/features/evidence/platformIcons';
import { sendAnonymousStat } from '@/features/stats/sendStat';
import {
  answer,
  getNode,
  isResultNode,
  remainingQuestions,
  replayPath,
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

const PROMISE_ICONS = [Lock, Clock3, DoorOpen];

interface Picked {
  step: TriageStep;
  label: string;
}

function resolveFrom(step: TriageStep): ResolvedResult | null {
  const node = getNode(tree, step.nodeId);
  return isResultNode(node) ? resolveResult(tree, node, step.context) : null;
}

/** Entrada: qué es, cuánto tarda, que es privado. */
function Intro({ onStart }: { onStart: () => void }) {
  const { accent } = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(240)} style={{ gap: spacing.xl }}>
      <View style={styles.hero}>
        <Svg width={180} height={180} style={styles.heroGlow} pointerEvents="none">
          <Defs>
            <RadialGradient id="orientGlow" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0" stopColor={accent} stopOpacity={0.35} />
              <Stop offset="1" stopColor={accent} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={90} cy={90} r={90} fill="url(#orientGlow)" />
        </Svg>
        <IconBadge icon={Compass} size={84} />
      </View>
      <View style={{ gap: spacing.sm }}>
        <AppText variant="title" center accessibilityRole="header">
          {S.triage.introTitle}
        </AppText>
        <AppText tone="textMuted" center>
          {S.triage.introBody}
        </AppText>
      </View>
      <View style={styles.promises}>
        {S.triage.promises.map((p, i) => {
          const Icon = PROMISE_ICONS[i];
          return (
            <View key={p.title} style={styles.promise}>
              <Icon size={18} color={accent} strokeWidth={1.9} />
              <View style={{ flex: 1 }}>
                <AppText variant="bodyStrong">{p.title}</AppText>
                <AppText variant="caption" tone="textMuted">
                  {p.body}
                </AppText>
              </View>
            </View>
          );
        })}
      </View>
      <View style={{ gap: spacing.sm }}>
        <Button label={S.triage.start} size="lg" onPress={onStart} />
        <Button
          label={S.triage.talkInstead}
          icon={Sparkles}
          variant="ghost"
          onPress={() => router.push('/asistente')}
        />
      </View>
    </Animated.View>
  );
}

/**
 * Orienta: entrada → una pregunta por pantalla (con explicación en cada opción) → resultado con
 * nivel, lo que contestó, qué dice la ley y un plan que se puede ir marcando.
 * Acepta `ruta` ("1.0.5") para abrir con las respuestas que se dieron en el chat de Vi.
 */
export default function Triage() {
  const { accent, colors } = useTheme();
  const meta = tabMeta('orientacion');
  const { ruta } = useLocalSearchParams<{ ruta?: string }>();
  const [started, setStarted] = useState(false);
  const [picked, setPicked] = useState<Picked[]>([]);
  const [resolved, setResolved] = useState<ResolvedResult | null>(null);

  // Recorrido que viene del chat de Vi (se aplica una vez por cada `ruta` nueva).
  const [appliedRuta, setAppliedRuta] = useState<string | undefined>();
  if (ruta && ruta !== appliedRuta) {
    const path = ruta.split('.').map(Number).filter((n) => Number.isInteger(n));
    const steps = replayPath(tree, path);
    const next = steps.slice(1).map((st, i) => {
      const node = getNode(tree, steps[i].nodeId);
      return { step: st, label: isResultNode(node) ? '' : (node.options[path[i]]?.label ?? '') };
    });
    setAppliedRuta(ruta);
    setStarted(true);
    setPicked(next);
    setResolved(resolveFrom(steps[steps.length - 1]));
  }

  const step = picked.length ? picked[picked.length - 1].step : START;
  const node = useMemo(() => getNode(tree, step.nodeId), [step.nodeId]);
  const answered = picked.length;
  const progress = resolved ? 1 : answered / (answered + Math.max(1, remainingQuestions(tree, step.nodeId)));

  const choose = (opt: TriageOption) => {
    const next = answer(step, opt);
    setPicked((p) => [...p, { step: next, label: opt.label }]);
    const r = resolveFrom(next);
    if (r) {
      setResolved(r);
      void sendAnonymousStat(r.result.kind, r.platform);
    }
  };

  const back = () => {
    setResolved(null);
    setPicked((p) => p.slice(0, -1));
  };

  const restart = () => {
    setResolved(null);
    setPicked([]);
    setStarted(false);
    if (ruta) router.setParams({ ruta: undefined });
  };

  const restartBtn =
    started && answered > 0 ? (
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
      {!started ? (
        <Intro onStart={() => setStarted(true)} />
      ) : (
        <>
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
              <ResultView resolved={resolved} answers={picked.map((p) => p.label)} onChange={back} />
            </Animated.View>
          ) : !isResultNode(node) ? (
            <Animated.View
              key={node.id}
              entering={FadeIn.duration(220)}
              style={{ marginTop: spacing.xl, gap: spacing.lg }}
            >
              <View style={{ gap: spacing.sm }}>
                <AppText variant="title" accessibilityRole="header">
                  {node.question}
                </AppText>
                {node.help ? <AppText tone="textMuted">{node.help}</AppText> : null}
              </View>

              <View style={{ gap: spacing.sm }}>
                {node.options.map((o) => {
                  const platform = o.set?.platform;
                  const Icon = platform ? PLATFORM_ICON[platform] : undefined;
                  return (
                    <Pressable
                      key={o.label}
                      accessibilityRole="button"
                      accessibilityLabel={o.hint ? `${o.label}. ${o.hint}` : o.label}
                      onPress={() => choose(o)}
                      style={({ pressed }) => [
                        styles.option,
                        pressed && { backgroundColor: alpha(accent, 0.14), borderColor: alpha(accent, 0.5) },
                      ]}
                    >
                      {Icon ? <IconBadge icon={Icon} size={38} /> : null}
                      <View style={{ flex: 1, gap: 2 }}>
                        <AppText variant="bodyStrong">{o.label}</AppText>
                        {o.hint ? (
                          <AppText variant="caption" tone="textMuted">
                            {o.hint}
                          </AppText>
                        ) : null}
                      </View>
                      <ChevronRight size={18} color={colors.textMuted} strokeWidth={1.75} />
                    </Pressable>
                  );
                })}
              </View>

              {step.context.unsure === 'si' && node.id === 'q_platform' ? <UrgentBlock /> : null}

              <AppText variant="caption" tone="textMuted">
                {S.triage.privateNote}
              </AppText>
            </Animated.View>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { height: 180, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  heroGlow: { position: 'absolute', left: '50%', marginLeft: -90, top: 0 },
  promises: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: HAIRLINE,
    borderColor: palette.stroke,
    backgroundColor: palette.glass,
  },
  promise: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
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
    minHeight: MIN_TOUCH + 12,
    borderRadius: radius.lg,
    borderWidth: HAIRLINE,
    borderColor: palette.strokeStrong,
    backgroundColor: palette.glassStrong,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
