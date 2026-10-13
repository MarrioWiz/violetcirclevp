import * as Haptics from 'expo-haptics';
import { CheckCircle2, MessageCircle, Phone, X } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { Backdrop } from '@/components/ui/Backdrop';
import { Button } from '@/components/Button';
import { recipients } from '@/features/circle/message';
import { openSmsComposer, openWhatsApp } from '@/features/circle/sendToCircle';
import { call911 } from '@/features/emergency/call';
import { S, t } from '@/lib/strings.es';
import { useCircle } from '@/store/circleStore';
import { useIncidents } from '@/store/incidentsStore';
import { useSession } from '@/store/sessionStore';
import { HAIRLINE, MIN_TOUCH, fonts, palette, radius, spacing } from '@/theme';

import { buildSosMessage } from './message';
import { getSosLocation, hasSmsPermission, sendSosSms, setShowWhenLocked, sosSupported } from './sosService';

export const SOS_SECONDS = 10;
const SIZE = 260;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

type Stage = 'countdown' | 'sending' | 'sent' | 'manual' | 'test' | 'cancelled' | 'noContacts';

/**
 * "Pedir ayuda".
 * - Desde fuera de la app: cuenta PARA CANCELAR (10 s; 4 s desde la mini app del botón lateral); si no se
 *   cancela, se envía sola (puede que ella no pueda tocar la pantalla). Tocar el círculo envía ya.
 * - Desde dentro de la app (círculo mantenido presionado): ya está confirmado, se envía de inmediato.
 * - Modo prueba: igual que desde fuera, pero nunca envía nada.
 * Se muestra encima de todo (PIN, calculadora y pantalla bloqueada) y no muestra datos privados.
 */
async function logToJournal(what: string) {
  // Hidratar antes de escribir: si no, se sobrescribiría la bitácora con una lista vacía.
  if (!useIncidents.getState().hydrated) await useIncidents.getState().hydrate();
  await useIncidents.getState().logAlert(what);
}

export function SosScreen() {
  const setSosActive = useSession((s) => s.setSosActive);
  const mode = useSession((s) => s.sosMode);
  const isTest = mode === 'test';
  // Si ya se había enviado (p. ej. la app se cerró y volvió a abrir), se muestra el resultado sin reenviar.
  const alreadySent = useSession.getState().sosSentAt !== null;
  const [stage, setStage] = useState<Stage>(alreadySent ? 'sent' : 'countdown');
  const [left, setLeft] = useState(() => useSession.getState().sosSeconds || SOS_SECONDS);
  const [count, setCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [message, setMessage] = useState('');
  const started = useRef(alreadySent);

  const close = useCallback(() => {
    void setShowWhenLocked(false);
    setSosActive(false);
  }, [setSosActive]);

  const cancel = useCallback(() => {
    if (started.current) return;
    started.current = true;
    setStage('cancelled');
  }, []);

  // Estable (sin dependencias de render): lee el modo directo del store.
  const send = useCallback(async () => {
    if (started.current) return;
    started.current = true;
    useSession.getState().markSosSent();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    setStage('sending');

    if (!useCircle.getState().hydrated) await useCircle.getState().hydrate();
    const contacts = useCircle.getState().contacts;
    const phones = recipients(
      contacts,
      contacts.map((c) => c.id),
    );
    const loc = await getSosLocation();
    const text = buildSosMessage(loc);
    setMessage(text);

    if (useSession.getState().sosMode === 'test') {
      setStage('test');
      return;
    }

    if (sosSupported && (await hasSmsPermission())) {
      try {
        const n = await sendSosSms(phones, text);
        setSentCount(n);
        setStage('sent');
        void logToJournal(
          `Pedí ayuda: se envió un SMS ${loc ? 'con mi ubicación ' : ''}a ${n} persona(s) de mi círculo.`,
        );
        return;
      } catch {
        // Si falla el envío automático, se abre Mensajes con todo listo.
      }
    }
    setStage('manual');
    void openSmsComposer(phones, text);
    void logToJournal('Pedí ayuda: abrí Mensajes con el texto y mi ubicación.');
  }, []);

  // Mostrar sobre la pantalla bloqueada y cargar el círculo (cifrado) aunque la app esté con PIN.
  useEffect(() => {
    void setShowWhenLocked(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
    void (async () => {
      if (!useCircle.getState().hydrated) await useCircle.getState().hydrate();
      const n = useCircle.getState().contacts.length;
      setCount(n);
      if (useSession.getState().sosSentAt !== null) return;
      if (n === 0) setStage('noContacts');
      else if (mode === 'hold') void send();
    })();
    return () => void setShowWhenLocked(false);
  }, [mode, send]);

  // Cuenta regresiva para CANCELAR: si llega a 0 sin que la cancele, se envía.
  useEffect(() => {
    if (stage !== 'countdown' || mode === 'hold') return;
    const id = setTimeout(() => {
      if (left <= 1) {
        setLeft(0);
        void send();
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      setLeft(left - 1);
    }, 1000);
    return () => clearTimeout(id);
  }, [stage, left, mode, send]);

  // Botón "atrás" de Android: durante la cuenta cancela; después cierra. Nunca saca la app
  // con la alerta abierta (eso la desmontaría a medias).
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stage === 'countdown') cancel();
      else if (stage !== 'sending') close();
      return true;
    });
    return () => sub.remove();
  }, [stage, close, cancel]);

  useEffect(() => {
    if (stage !== 'cancelled') return;
    const id = setTimeout(close, 2500);
    return () => clearTimeout(id);
  }, [stage, close]);

  const progress = stage === 'countdown' ? left / (useSession.getState().sosSeconds || SOS_SECONDS) : 1;

  return (
    <SafeAreaView style={styles.root}>
      <Backdrop accent={palette.violet} />
      <View style={styles.top}>
        {isTest ? (
          <AppText variant="label" style={[styles.white, { flex: 1, alignSelf: 'center' }]}>
            {S.sos.testBadge}
          </AppText>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={S.sos.cancel}
          onPress={stage === 'countdown' ? cancel : close}
          hitSlop={8}
          style={styles.closeBtn}
        >
          <X size={24} color={palette.white} />
        </Pressable>
      </View>

      <View style={styles.center}>
        {stage === 'countdown' || stage === 'sending' ? (
          <>
            <AppText variant="title" center style={styles.white} accessibilityRole="header">
              {S.sos.title}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${S.sos.tapToSendNow}. ${t(S.sos.secondsLeft, { s: left })}`}
              accessibilityHint={t(S.sos.willSend, { n: count })}
              onPress={() => void send()}
              disabled={stage === 'sending'}
              style={({ pressed }) => [styles.circleWrap, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}
            >
              <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
                <Defs>
                  <RadialGradient id="sosFill" cx="35%" cy="30%" rx="75%" ry="75%">
                    <Stop offset="0" stopColor={palette.violetLight} />
                    <Stop offset="1" stopColor={palette.violetDeep} />
                  </RadialGradient>
                </Defs>
                <Circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  stroke={palette.strokeStrong}
                  strokeWidth={STROKE}
                  fill="url(#sosFill)"
                />
                <Circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  stroke={palette.white}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${CIRC} ${CIRC}`}
                  strokeDashoffset={CIRC * (1 - progress)}
                  transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                />
              </Svg>
              <AppText style={styles.seconds} accessibilityElementsHidden>
                {stage === 'sending' ? '…' : left}
              </AppText>
              <AppText variant="bodyStrong" center style={styles.white}>
                {stage === 'sending' ? S.sos.sending : S.sos.tapToSendNow}
              </AppText>
            </Pressable>
            <AppText center style={styles.soft}>
              {stage === 'sending' ? S.sos.gettingLocation : t(S.sos.willSendIn, { n: count, s: left })}
            </AppText>
            <AppText variant="caption" center style={styles.soft}>
              {S.sos.cancelHint}
            </AppText>
          </>
        ) : null}

        {stage === 'sent' || stage === 'manual' ? (
          <>
            <CheckCircle2 size={72} color={palette.white} />
            <AppText
              variant="title"
              center
              style={styles.white}
              accessibilityRole="header"
              accessibilityLiveRegion="polite"
            >
              {stage === 'sent' ? (sentCount > 0 ? t(S.sos.sent, { n: sentCount }) : S.sos.alreadySent) : S.sos.manual}
            </AppText>
            <AppText center style={styles.soft}>
              {S.sos.stayTogether}
            </AppText>
          </>
        ) : null}

        {stage === 'test' ? (
          <>
            <AppText variant="heading" center style={styles.white} accessibilityRole="header">
              {S.sos.testSent}
            </AppText>
            <View style={styles.preview}>
              <AppText style={styles.white} selectable>
                {message}
              </AppText>
            </View>
          </>
        ) : null}

        {stage === 'cancelled' ? (
          <AppText variant="title" center style={styles.white} accessibilityLiveRegion="polite">
            {S.sos.cancelled}
          </AppText>
        ) : null}

        {stage === 'noContacts' ? (
          <>
            <AppText variant="title" center style={styles.white}>
              {S.sos.noContacts}
            </AppText>
            <AppText center style={styles.soft}>
              {S.sos.noContactsBody}
            </AppText>
          </>
        ) : null}
      </View>

      <View style={styles.bottom}>
        {stage === 'sent' || stage === 'manual' ? (
          <Button
            label={S.sos.alsoWhatsApp}
            icon={MessageCircle}
            variant="secondary"
            onPress={() => void openWhatsApp(message)}
          />
        ) : null}
        <Button label={S.emergency.call911} icon={Phone} variant="danger" size="lg" onPress={() => void call911()} />
        {stage === 'countdown' ? (
          <Button label={S.sos.cancelNow} variant="inverse" size="lg" onPress={cancel} />
        ) : stage !== 'sending' ? (
          <Button label={S.common.close} variant="inverse" onPress={close} />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: palette.bg0 },
  top: { flexDirection: 'row', justifyContent: 'flex-end', padding: spacing.lg },
  closeBtn: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: MIN_TOUCH / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.glassStrong,
    borderWidth: HAIRLINE,
    borderColor: palette.strokeStrong,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingHorizontal: spacing.xl },
  circleWrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  seconds: { color: palette.white, fontFamily: fonts.display, fontSize: 76, lineHeight: 82, letterSpacing: -3 },
  white: { color: palette.white },
  soft: { color: palette.textMuted },
  bottom: { padding: spacing.xl, gap: spacing.sm },
  preview: {
    backgroundColor: palette.glassStrong,
    borderWidth: HAIRLINE,
    borderColor: palette.strokeStrong,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignSelf: 'stretch',
  },
});
