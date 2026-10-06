import { RotateCcw } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { tabMeta } from '@/components/dock/tabs';
import { useDockInset } from '@/components/dock/useDockInset';
import { Backdrop } from '@/components/ui/Backdrop';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Sheen } from '@/components/ui/Sheen';
import { QuickExitButton } from '@/components/QuickExitButton';
import { bundled } from '@/features/content/repository';
import { sendAnonymousStat } from '@/features/stats/sendStat';
import {
  answer,
  getNode,
  isResultNode,
  resolveResult,
  type ResolvedResult,
  type TriageStep,
} from '@/features/triage/engine';
import { ResultView, UrgentBlock } from '@/features/triage/ResultView';
import { S } from '@/lib/strings.es';
import { HAIRLINE, alpha, palette, radius, spacing, useTheme } from '@/theme';
import type { TriageOption } from '@/types';

interface Message {
  id: string;
  from: 'bot' | 'me';
  text: string;
  help?: string;
}

const tree = bundled.triage;
let seq = 0;
const nextId = (prefix: string) => `${prefix}-${++seq}`;

function questionMessage(nodeId: string): Message {
  const node = getNode(tree, nodeId);
  if (isResultNode(node)) throw new Error('not a question');
  return { id: nextId(`q-${nodeId}`), from: 'bot', text: node.question, help: node.help };
}

export default function Triage() {
  const { colors, accent } = useTheme();
  const meta = tabMeta('orientacion');
  const dockInset = useDockInset();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState<TriageStep>({ nodeId: tree.start, context: {} });
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 'intro', from: 'bot', text: S.triage.intro },
    questionMessage(tree.start),
  ]);
  const [resolved, setResolved] = useState<ResolvedResult | null>(null);

  const node = useMemo(() => getNode(tree, step.nodeId), [step.nodeId]);

  const choose = (opt: TriageOption) => {
    const next = answer(step, opt);
    const nextNode = getNode(tree, next.nodeId);
    const mine: Message = { id: nextId('a'), from: 'me', text: opt.label };
    setStep(next);
    if (isResultNode(nextNode)) {
      const r = resolveResult(tree, nextNode, next.context);
      setMessages((m) => [...m, mine]);
      setResolved(r);
      void sendAnonymousStat(r.result.kind, r.platform);
    } else {
      setMessages((m) => [...m, mine, questionMessage(next.nodeId)]);
    }
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  };

  const restart = () => {
    setStep({ nodeId: tree.start, context: {} });
    setMessages([{ id: 'intro', from: 'bot', text: S.triage.intro }, questionMessage(tree.start)]);
    setResolved(null);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  return (
    <View style={{ flex: 1 }}>
      <Backdrop />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.topBar}>
          {messages.length > 2 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={S.triage.restart}
              onPress={restart}
              style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <RotateCcw size={18} color={colors.text} strokeWidth={1.75} />
            </Pressable>
          ) : (
            <View />
          )}
          <QuickExitButton />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.content, { paddingBottom: dockInset }]}
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader eyebrow={S.triage.assistantBadge} title={meta.title} subtitle={meta.subtitle} />

          <View style={styles.note}>
            <AppText variant="caption" tone="textMuted">
              {S.triage.assistantNote}
            </AppText>
          </View>

          {messages.map((m, idx) => {
            const bot = m.from === 'bot';
            return (
              <Animated.View
                key={m.id}
                entering={FadeInDown.duration(260)}
                style={[
                  styles.bubble,
                  bot
                    ? styles.botBubble
                    : {
                        alignSelf: 'flex-end',
                        backgroundColor: alpha(accent, 0.16),
                        borderColor: alpha(accent, 0.4),
                        borderBottomRightRadius: radius.xs,
                      },
                ]}
              >
                {bot && <Sheen />}
                {bot && idx === 0 && (
                  <AppText variant="label" style={{ color: accent, fontSize: 10, marginBottom: spacing.xs }}>
                    {S.triage.assistantBadge}
                  </AppText>
                )}
                <AppText>{m.text}</AppText>
                {m.help ? (
                  <AppText variant="caption" tone="textMuted" style={{ marginTop: spacing.xs }}>
                    {m.help}
                  </AppText>
                ) : null}
              </Animated.View>
            );
          })}

          {resolved ? (
            <Animated.View entering={FadeInDown.duration(300)} style={{ marginTop: spacing.lg }}>
              <ResultView resolved={resolved} />
            </Animated.View>
          ) : !isResultNode(node) ? (
            <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
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
                  <AppText variant="bodyStrong">{o.label}</AppText>
                </Pressable>
              ))}
            </View>
          ) : null}

          {!resolved && step.context.unsure === 'si' && node.id === 'q_platform' ? (
            <View style={{ marginTop: spacing.lg }}>
              <UrgentBlock />
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
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
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.sm },
  note: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: HAIRLINE,
    borderColor: palette.stroke,
    borderStyle: 'dashed',
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: radius.lg,
    borderWidth: HAIRLINE,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    overflow: 'hidden',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: palette.glass,
    borderColor: palette.stroke,
    borderBottomLeftRadius: radius.xs,
  },
  option: {
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: HAIRLINE,
    borderColor: palette.strokeStrong,
    backgroundColor: palette.glassStrong,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
});
