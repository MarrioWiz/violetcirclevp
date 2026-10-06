import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { S } from '@/lib/strings.es';
import { spacing, useTheme } from '@/theme';

const PHASE_MS = 2500; // 2.5 s inhalar + 2.5 s exhalar = 5 s

/** Respiración corta y opcional. Respeta "Reducir movimiento". */
export function BreathingCircle() {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(0.75);
  const [inhale, setInhale] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setInhale((v) => !v), PHASE_MS);
    if (!reduceMotion) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: PHASE_MS, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.75, { duration: PHASE_MS, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      );
    }
    return () => {
      clearInterval(id);
      cancelAnimation(scale);
    };
  }, [reduceMotion, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md }}>
      <View style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={[
            { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: colors.primarySoft },
            style,
          ]}
        />
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, opacity: 0.85 }} />
      </View>
      <AppText tone="primary" variant="bodyStrong" accessibilityLiveRegion="polite">
        {inhale ? S.alert.breatheIn : S.alert.breatheOut}
      </AppText>
    </View>
  );
}
