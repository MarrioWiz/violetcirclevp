import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useIsFocused } from 'expo-router';
import { HandHeart } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { S } from '@/lib/strings.es';
import { useSession } from '@/store/sessionStore';
import { HAIRLINE, alpha, gradients, palette, spacing } from '@/theme';

const HOLD_MS = 2000;
/** Si suelta antes de esto, cuenta como toque (abrir opciones), no como intento de envío. */
const TAP_MS = 250;
const ORB = 168;
const RING = ORB + 32;
const GLOW = ORB * 1.9;
const STROKE = 6;
const R = (RING - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Botón principal de Inicio: tocar = opciones de ayuda; mantener 2 s = enviar SMS con ubicación.
 * El anillo se llena mientras mantiene presionado; si suelta antes, no se envía nada.
 */
export function HoldToHelpOrb() {
  const reduceMotion = useReducedMotion();
  const setSosActive = useSession((s) => s.setSosActive);
  const progress = useSharedValue(0);
  const breathe = useSharedValue(0);
  const pressedAt = useRef(0);
  const [holding, setHolding] = useState(false);

  // Solo "respira" cuando Inicio está a la vista y desbloqueada: ahorra batería y no anima
  // detrás del PIN, la capa de privacidad ni otras pestañas.
  const focused = useIsFocused();
  const locked = useSession((s) => s.locked || s.covered || s.disguised);
  const animate = !reduceMotion && focused && !locked;

  useEffect(() => {
    if (!animate) {
      cancelAnimation(breathe);
      breathe.value = 0;
      return;
    }
    breathe.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.ease) }), -1, false);
    return () => cancelAnimation(breathe);
  }, [animate, breathe]);

  const fire = () => {
    setHolding(false);
    progress.value = 0;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    setSosActive(true, 'hold');
  };

  const onPressIn = () => {
    pressedAt.current = Date.now();
    setHolding(true);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    progress.value = withTiming(1, { duration: HOLD_MS, easing: Easing.linear }, (finished) => {
      if (finished) runOnJS(fire)();
    });
  };

  const onPressOut = () => {
    const quickTap = Date.now() - pressedAt.current < TAP_MS;
    cancelAnimation(progress);
    progress.value = withTiming(0, { duration: 200 });
    if (holding) setHolding(false);
    if (quickTap) router.push('/alerta');
  };

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: CIRC * (1 - progress.value) }));
  const ringA = useAnimatedStyle(() => ({
    opacity: 0.35 * (1 - breathe.value),
    transform: [{ scale: 1 + 0.12 * breathe.value }],
  }));
  const ringB = useAnimatedStyle(() => {
    const v = (breathe.value + 0.5) % 1;
    return { opacity: 0.35 * (1 - v), transform: [{ scale: 1 + 0.12 * v }] };
  });
  const orbScale = useAnimatedStyle(() => ({ transform: [{ scale: 1 - 0.04 * progress.value }] }));

  return (
    <View style={styles.wrap}>
      <View style={styles.stage}>
        {/* Resplandor radial detrás del orbe */}
        <Svg width={GLOW} height={GLOW} style={styles.glow} pointerEvents="none">
          <Defs>
            <RadialGradient id="orbGlow" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0" stopColor={palette.violet} stopOpacity={0.45} />
              <Stop offset="0.55" stopColor={palette.violet} stopOpacity={0.12} />
              <Stop offset="1" stopColor={palette.violet} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={GLOW / 2} cy={GLOW / 2} r={GLOW / 2} fill="url(#orbGlow)" />
        </Svg>
        {animate && (
          <>
            <Animated.View style={[styles.breath, ringA]} pointerEvents="none" />
            <Animated.View style={[styles.breath, ringB]} pointerEvents="none" />
          </>
        )}
        <Svg width={RING} height={RING} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Circle
            cx={RING / 2}
            cy={RING / 2}
            r={R}
            stroke={alpha(palette.violetLight, 0.18)}
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={RING / 2}
            cy={RING / 2}
            r={R}
            stroke={palette.text}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${CIRC} ${CIRC}`}
            animatedProps={ringProps}
            transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
          />
        </Svg>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={S.home.helpNow}
          accessibilityHint={S.sos.holdHint}
          accessibilityActions={[
            { name: 'activate', label: S.home.helpNowHint },
            { name: 'longpress', label: S.sos.holdToSend },
          ]}
          onAccessibilityAction={(e) => {
            if (e.nativeEvent.actionName === 'activate') router.push('/alerta');
            if (e.nativeEvent.actionName === 'longpress') setSosActive(true, 'hold');
          }}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <Animated.View style={orbScale}>
            <LinearGradient colors={gradients.orb} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.orb}>
              <LinearGradient
                colors={[palette.beadShine, 'transparent']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.6, y: 0.7 }}
                style={StyleSheet.absoluteFill}
              />
              <HandHeart size={36} color={palette.white} strokeWidth={1.75} />
              <AppText variant="heading" center style={styles.white}>
                {holding ? S.sos.holding : S.sos.title}
              </AppText>
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </View>
      <AppText variant="caption" tone="textMuted" center style={{ marginTop: spacing.md, maxWidth: 300 }}>
        {S.sos.holdHint}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  stage: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', left: (RING - GLOW) / 2, top: (RING - GLOW) / 2 },
  breath: {
    position: 'absolute',
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    borderWidth: HAIRLINE,
    borderColor: palette.violetLight,
  },
  orb: {
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: HAIRLINE,
    borderColor: palette.beadRim,
    overflow: 'hidden',
  },
  white: { color: palette.white },
});
