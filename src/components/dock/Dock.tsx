import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import type { Tabs } from 'expo-router';
import { useEffect, useMemo, useState, type ComponentProps } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Ellipse, LinearGradient as SvgLinear, Path, RadialGradient, Stop } from 'react-native-svg';

import { accents, alpha, fonts, palette, useAccentStore } from '@/theme';

import { dockPath, tabCenters } from './dockPath';
import { tabMeta } from './tabs';
import { DOCK } from './useDockInset';

type DockProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const AnimatedPath = Animated.createAnimatedComponent(Path);
const LABEL_W = 96;
const HALO_W = 220;
const HALO_H = 90;
const SPRING = { damping: 16, stiffness: 180, mass: 0.8 };

/**
 * Tab bar "líquido": barra de vidrio con una muesca que se derrite alrededor de una perla
 * del color de acento de la pestaña activa. La perla se desplaza con resorte y la muesca se
 * estira según la velocidad (hombros asimétricos) hasta volver a ser simétrica al asentarse.
 */
export function Dock({ state, navigation, descriptors }: DockProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const setAccent = useAccentStore((s) => s.setKey);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const { H, R, bead: r, gap, fillet: f, side } = DOCK;
  const rr = r + gap;
  const W = width - side * 2;
  const routes = state.routes;
  const metas = useMemo(() => routes.map((rt) => tabMeta(rt.name)), [routes]);
  const centers = useMemo(() => tabCenters(W, R, rr, f, routes.length), [W, R, rr, f, routes.length]);
  const colors = useMemo(() => metas.map((m) => accents[m.accent]), [metas]);
  const step = centers.length > 1 ? centers[1] - centers[0] : 1;

  const x = useSharedValue(centers[state.index]);
  const target = useSharedValue(centers[state.index]);
  const beadOpacity = useSharedValue(1);

  // Mover la perla al cambiar de pestaña.
  useEffect(() => {
    const to = centers[state.index];
    target.value = to;
    if (reduceMotion) {
      // Sin resortes ni inclinación: salta y aparece con un fundido corto.
      x.value = to;
      beadOpacity.value = 0;
      beadOpacity.value = withTiming(1, { duration: 150 });
    } else {
      x.value = withSpring(to, SPRING);
    }
    setAccent(metas[state.index].accent);
  }, [state.index, centers, reduceMotion, metas, setAccent, x, target, beadOpacity]);

  // Ocultar el dock con el teclado abierto.
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () =>
      setKeyboardOpen(true),
    );
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () =>
      setKeyboardOpen(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const pathProps = useAnimatedProps(() => {
    const v = Math.max(-1, Math.min(1, (target.value - x.value) / step));
    const fL = Math.max(2, f * (1 + 0.8 * v));
    const fR = Math.max(2, f * (1 - 0.5 * v));
    return { d: dockPath(W, H, R, x.value, rr, fL, fR) };
  });

  const beadStyle = useAnimatedStyle(() => ({
    opacity: beadOpacity.value,
    transform: [{ translateX: x.value - r }],
    backgroundColor: interpolateColor(x.value, centers, colors),
  }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: beadOpacity.value,
    transform: [{ translateX: x.value - LABEL_W / 2 }],
    color: interpolateColor(x.value, centers, colors),
  }));
  const haloStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value - HALO_W / 2 }] }));

  const active = metas[state.index];
  const activeColor = accents[active.accent];
  const ActiveIcon = active.icon;

  if (keyboardOpen) return null;

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.wrap, { width: W, left: side, bottom: insets.bottom + 8, height: r + H }]}
      pointerEvents="box-none"
    >
      {/* 1. Halo de acento debajo de la barra */}
      <Animated.View pointerEvents="none" style={[styles.halo, { top: r + H - HALO_H / 2 }, haloStyle]}>
        <Svg width={HALO_W} height={HALO_H}>
          <Defs>
            <RadialGradient id="halo" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0" stopColor={activeColor} stopOpacity={0.35} />
              <Stop offset="1" stopColor={activeColor} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={HALO_W / 2} cy={HALO_H / 2} rx={HALO_W / 2} ry={HALO_H / 2} fill="url(#halo)" />
        </Svg>
      </Animated.View>

      {/* 2-3. Barra de vidrio con muesca líquida y brillo superior */}
      <Svg width={W} height={H} style={{ position: 'absolute', top: r }} pointerEvents="none">
        <Defs>
          <SvgLinear id="edge" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.white} stopOpacity={0.18} />
            <Stop offset="1" stopColor={palette.white} stopOpacity={0.04} />
          </SvgLinear>
        </Defs>
        <AnimatedPath animatedProps={pathProps} fill={palette.bg1} fillOpacity={0.97} />
        <AnimatedPath animatedProps={pathProps} fill="none" stroke="url(#edge)" strokeWidth={1} />
      </Svg>

      {/* 4. Íconos inactivos (y área táctil de cada pestaña) */}
      {routes.map((route, i) => {
        const meta = metas[i];
        const focused = state.index === i;
        const Icon = meta.icon;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
            navigation.navigate(route.name, route.params);
          }
        };
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={descriptors[route.key]?.options.tabBarAccessibilityLabel ?? meta.a11y}
            onPress={onPress}
            hitSlop={4}
            style={[styles.tab, { left: centers[i] - 26, top: r + H / 2 - 26 }]}
          >
            {!focused && <Icon size={22} color={alpha(palette.textMuted, 0.7)} strokeWidth={1.75} />}
          </Pressable>
        );
      })}

      {/* 5. Perla y etiqueta de la pestaña activa */}
      <Animated.View
        pointerEvents="none"
        style={[styles.bead, { width: r * 2, height: r * 2, borderRadius: r }, beadStyle]}
      >
        {/* Claro arriba-izquierda → acento abajo-derecha */}
        <LinearGradient
          colors={[palette.beadShine, 'transparent']}
          start={{ x: 0.15, y: 0.1 }}
          end={{ x: 0.85, y: 0.9 }}
          style={[StyleSheet.absoluteFill, { borderRadius: r }]}
        />
        <View style={[styles.beadRim, { borderRadius: r }]} />
        <ActiveIcon size={22} color={palette.bg0} strokeWidth={2} />
      </Animated.View>
      <Animated.Text
        pointerEvents="none"
        numberOfLines={1}
        style={[styles.label, { top: r + rr + 3 }, labelStyle]}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        {active.label}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', overflow: 'visible' },
  halo: { position: 'absolute', left: 0, width: HALO_W, height: HALO_H },
  tab: { position: 'absolute', width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  bead: { position: 'absolute', top: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  beadRim: { ...StyleSheet.absoluteFill, borderWidth: 1, borderColor: palette.beadRim },
  label: {
    position: 'absolute',
    left: 0,
    width: LABEL_W,
    textAlign: 'center',
    fontFamily: fonts.semi,
    fontSize: 12,
  },
});
