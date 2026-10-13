import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ArrowUp, Phone, RotateCcw, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { QuickExitButton } from '@/components/QuickExitButton';
import { Backdrop } from '@/components/ui/Backdrop';
import { useAssistant, type ChatMessage } from '@/features/assistant/assistantStore';
import type { BotAction } from '@/features/assistant/engine';
import { ViAvatar } from '@/features/assistant/ViAvatar';
import { call911, callNumber } from '@/features/emergency/call';
import { S } from '@/lib/strings.es';
import { HAIRLINE, MIN_TOUCH, alpha, fonts, gradients, palette, radius, spacing, typeScale, useTheme } from '@/theme';

function runAction(a: BotAction) {
  if (a.kind === 'call911') return void call911();
  if (a.kind === 'call') return void callNumber(a.phone);
  // Cierra el chat y abre la sección (así "atrás" no regresa a un chat encima de otro modal).
  if (router.canGoBack()) router.back();
  setTimeout(() => router.push(a.href as Href), 60);
}

function Dot({ delay }: { delay: number }) {
  const reduce = useReducedMotion();
  const v = useSharedValue(0.3);
  useEffect(() => {
    if (reduce) return;
    v.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 320 }), withTiming(0.3, { duration: 320 })), -1),
    );
  }, [delay, reduce, v]);
  const style = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ translateY: (1 - v.value) * 2 }] }));
  return <Animated.View style={[styles.dot, style]} />;
}

function TypingBubble() {
  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      style={[styles.row]}
      accessible
      accessibilityLabel={S.assistant.typing}
      accessibilityLiveRegion="polite"
    >
      <ViAvatar size={28} />
      <View style={[styles.bubble, styles.bot, { flexDirection: 'row', gap: 5, paddingVertical: spacing.md + 2 }]}>
        <Dot delay={0} />
        <Dot delay={160} />
        <Dot delay={320} />
      </View>
    </Animated.View>
  );
}

function Bubble({ m, showAvatar }: { m: ChatMessage; showAvatar: boolean }) {
  const { accent } = useTheme();
  if (m.from === 'user') {
    return (
      <Animated.View entering={FadeInDown.duration(220)} style={{ alignItems: 'flex-end' }}>
        <View
          style={[
            styles.bubble,
            { backgroundColor: alpha(accent, 0.18), borderColor: alpha(accent, 0.35), borderBottomRightRadius: radius.xs },
          ]}
        >
          <AppText>{m.text}</AppText>
        </View>
      </Animated.View>
    );
  }
  return (
    <Animated.View entering={FadeInDown.duration(260)} style={styles.row} accessibilityLiveRegion="polite">
      {showAvatar ? <ViAvatar size={28} /> : <View style={{ width: 28 }} />}
      <View style={{ flex: 1, alignItems: 'flex-start', gap: spacing.sm }}>
        <View
          style={[
            styles.bubble,
            styles.bot,
            m.urgent && { backgroundColor: alpha(palette.danger, 0.1), borderColor: alpha(palette.danger, 0.35) },
          ]}
        >
          <AppText>{m.text}</AppText>
        </View>
        {m.actions?.length ? (
          <View style={styles.actions}>
            {m.actions.map((a) => {
              const danger = a.kind === 'call911';
              return (
                <Pressable
                  key={a.label}
                  accessibilityRole="button"
                  accessibilityLabel={a.label}
                  onPress={() => runAction(a)}
                  style={({ pressed }) => [
                    styles.action,
                    danger && { backgroundColor: alpha(palette.danger, 0.14), borderColor: alpha(palette.danger, 0.4) },
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  {a.kind !== 'route' && <Phone size={14} color={danger ? palette.danger : accent} strokeWidth={2} />}
                  <AppText variant="caption" style={{ fontFamily: fonts.semi, color: danger ? palette.danger : accent }}>
                    {a.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

/** Chat con Vi: burbujas, "escribiendo…", sugerencias y botones de acción. */
export default function AssistantChat() {
  const { accent, textScale } = useTheme();
  const messages = useAssistant((s) => s.messages);
  const suggestions = useAssistant((s) => s.suggestions);
  const typing = useAssistant((s) => s.typing);
  const send = useAssistant((s) => s.send);
  const reset = useAssistant((s) => s.reset);
  const [text, setText] = useState('');
  const scroll = useRef<ScrollView>(null);

  // Baja al final con cada burbuja nueva (después de que entra su animación).
  useEffect(() => {
    const toEnd = () => scroll.current?.scrollToEnd({ animated: true });
    // Dos intentos: uno rápido y otro cuando ya terminó la animación de entrada de la burbuja.
    const a = setTimeout(toEnd, 80);
    const b = setTimeout(toEnd, 420);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [messages.length, typing, suggestions.length]);

  // Desde un resultado de Orienta ("Hablar con Vi sobre esto"): Vi abre con ese tema, una sola vez.
  const { tema } = useLocalSearchParams<{ tema?: string }>();
  const topicDone = useRef<string | null>(null);
  useEffect(() => {
    if (!tema || topicDone.current === tema) return;
    topicDone.current = tema;
    void useAssistant.getState().startTopic(tema);
  }, [tema]);

  const longChips = suggestions.some((x) => x.length > 30);

  const submit = (value: string) => {
    if (!value.trim() || typing) return;
    setText('');
    void send(value);
  };

  return (
    <View style={{ flex: 1 }}>
      <Backdrop />
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        {/* Encabezado */}
        <View style={styles.header}>
          <ViAvatar size={40} />
          <View style={{ flex: 1 }}>
            <AppText variant="heading" accessibilityRole="header">
              {S.assistant.name}
            </AppText>
            <AppText variant="caption" tone="textMuted" numberOfLines={1}>
              {S.assistant.status}
            </AppText>
          </View>
          {messages.length > 2 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={S.assistant.restart}
              onPress={reset}
              hitSlop={6}
              style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <RotateCcw size={18} color={palette.text} strokeWidth={1.75} />
            </Pressable>
          )}
          <QuickExitButton compact />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar chat"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            hitSlop={6}
            style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <X size={20} color={palette.text} strokeWidth={1.9} />
          </Pressable>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'web' ? undefined : 'padding'}>
          <ScrollView
            ref={scroll}
            style={{ flex: 1 }}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
            // Al aparecer/desaparecer las sugerencias el área cambia de alto: volver a bajar.
            onLayout={() => scroll.current?.scrollToEnd({ animated: false })}
          >
            <AppText variant="caption" tone="textMuted" center style={{ marginBottom: spacing.sm }}>
              {S.assistant.privacy}
            </AppText>
            {messages.map((m, i) => (
              <Bubble key={m.id} m={m} showAvatar={m.from === 'bot' && messages[i - 1]?.from !== 'bot'} />
            ))}
            {typing && <TypingBubble />}
          </ScrollView>

          {suggestions.length > 0 && !typing && (
            <ScrollView
              // Opciones largas (preguntas de Orienta) en lista vertical; cortas, en fila.
              horizontal={!longChips}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={longChips ? styles.chipsColumn : { flexGrow: 0 }}
              contentContainerStyle={longChips ? styles.chipsColumnContent : styles.chips}
            >
              {suggestions.map((s) => (
                <Pressable
                  key={s}
                  accessibilityRole="button"
                  accessibilityLabel={s}
                  onPress={() => submit(s)}
                  style={({ pressed }) => [
                    styles.chip,
                    longChips && styles.chipWide,
                    { borderColor: alpha(accent, 0.4), opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <AppText variant="caption" style={{ fontFamily: fonts.semi, color: accent }}>
                    {s}
                  </AppText>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Campo de texto */}
          <View style={styles.composer}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={S.assistant.placeholder}
              placeholderTextColor={palette.textMuted}
              accessibilityLabel={S.assistant.placeholder}
              onSubmitEditing={() => submit(text)}
              // Web: Enter envía y Shift+Enter hace salto de línea (como cualquier chat).
              onKeyPress={(e) => {
                const ev = e.nativeEvent as unknown as { key: string; shiftKey?: boolean };
                if (Platform.OS === 'web' && ev.key === 'Enter' && !ev.shiftKey) {
                  (e as unknown as { preventDefault: () => void }).preventDefault();
                  submit(text);
                }
              }}
              returnKeyType="send"
              submitBehavior="submit"
              multiline
              maxLength={500}
              style={[
                styles.input,
                { fontSize: (typeScale.body.fontSize ?? 16) * textScale },
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
              ]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={S.assistant.send}
              accessibilityState={{ disabled: !text.trim() || typing }}
              disabled={!text.trim() || typing}
              onPress={() => submit(text)}
              style={({ pressed }) => [styles.send, { opacity: !text.trim() || typing ? 0.4 : pressed ? 0.8 : 1 }]}
            >
              <LinearGradient colors={gradients.primary} style={StyleSheet.absoluteFill} />
              <View style={{ zIndex: 1 }}>
                <ArrowUp size={20} color={palette.white} strokeWidth={2.2} />
              </View>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: HAIRLINE,
    borderBottomColor: palette.stroke,
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
  list: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  bubble: {
    maxWidth: '86%',
    borderRadius: radius.lg,
    borderWidth: HAIRLINE,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bot: {
    backgroundColor: palette.glassStrong,
    borderColor: palette.stroke,
    borderBottomLeftRadius: radius.xs,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.textMuted },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: HAIRLINE,
    borderColor: palette.strokeStrong,
    backgroundColor: palette.glass,
  },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  chipsColumn: { flexGrow: 0, maxHeight: 230 },
  chipsColumnContent: { gap: 6, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  chipWide: { paddingVertical: spacing.sm, borderRadius: radius.md },
  chip: {
    minHeight: 38,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: HAIRLINE,
    backgroundColor: palette.glass,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: HAIRLINE,
    borderTopColor: palette.stroke,
  },
  input: {
    flex: 1,
    minHeight: MIN_TOUCH,
    maxHeight: 120,
    paddingHorizontal: spacing.lg,
    paddingTop: 13,
    paddingBottom: 13,
    borderRadius: radius.lg,
    borderWidth: HAIRLINE,
    borderColor: palette.strokeStrong,
    backgroundColor: palette.glass,
    color: palette.text,
    fontFamily: fonts.body,
  },
  send: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: MIN_TOUCH / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
