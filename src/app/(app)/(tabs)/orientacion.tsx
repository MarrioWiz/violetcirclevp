import { Bot, RotateCcw } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
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
import { MIN_TOUCH, radius, spacing, useTheme } from '@/theme';
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
  const { colors } = useTheme();
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
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <AppText variant="heading" accessibilityRole="header">
            {S.triage.title}
          </AppText>
          <View style={styles.badgeRow}>
            <Bot size={14} color={colors.primary} />
            <AppText variant="caption" tone="primary" style={{ fontFamily: 'Inter_600SemiBold' }}>
              {S.triage.assistantBadge}
            </AppText>
          </View>
        </View>
        {messages.length > 2 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={S.triage.restart}
            onPress={restart}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceAlt }]}
          >
            <RotateCcw size={18} color={colors.text} />
          </Pressable>
        )}
        <QuickExitButton compact />
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.note, { backgroundColor: colors.surfaceAlt }]}>
          <AppText variant="caption" tone="textMuted" center>
            {S.triage.assistantNote}
          </AppText>
        </View>

        {messages.map((m) => (
          <Animated.View
            key={m.id}
            entering={FadeInDown.duration(260)}
            style={[
              styles.bubble,
              m.from === 'bot'
                ? {
                    alignSelf: 'flex-start',
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderBottomLeftRadius: 6,
                  }
                : {
                    alignSelf: 'flex-end',
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                    borderBottomRightRadius: 6,
                  },
            ]}
          >
            <AppText style={m.from === 'me' ? { color: colors.onPrimary } : undefined}>{m.text}</AppText>
            {m.help ? (
              <AppText variant="caption" tone="textMuted" style={{ marginTop: spacing.xs }}>
                {m.help}
              </AppText>
            ) : null}
          </Animated.View>
        ))}

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
                  { borderColor: colors.primary, backgroundColor: pressed ? colors.primarySoft : colors.surface },
                ]}
              >
                <AppText variant="bodyStrong" tone="primary">
                  {o.label}
                </AppText>
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
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  iconBtn: {
    width: MIN_TOUCH - 4,
    height: MIN_TOUCH - 4,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl * 2, gap: spacing.sm },
  note: { borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  bubble: {
    maxWidth: '88%',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  option: {
    minHeight: MIN_TOUCH + 4,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
});
