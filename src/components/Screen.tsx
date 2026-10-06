import { router } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { HAIRLINE, MIN_TOUCH, palette, radius, spacing } from '@/theme';

import { AppText } from './AppText';
import { useDockInset } from './dock/useDockInset';
import { QuickExitButton } from './QuickExitButton';
import { Backdrop } from './ui/Backdrop';
import { ScreenHeader } from './ui/ScreenHeader';

interface Props {
  title?: string;
  subtitle?: string;
  /** Texto del "eyebrow" (por defecto, VioletCircleVP). */
  eyebrow?: string;
  /** 'back' = flecha, 'close' = X (modales), false = sin botón. */
  nav?: 'back' | 'close' | false;
  quickExit?: boolean;
  scroll?: boolean;
  footer?: ReactNode;
  headerRight?: ReactNode;
  children: ReactNode;
  edges?: Edge[];
  /** Título gigante (pestañas) o grande (pantallas internas). */
  largeTitle?: boolean;
  /** Pantalla de pestaña: deja espacio para el dock y pone el footer al final del contenido. */
  dock?: boolean;
}

const COLLAPSE_FROM = 40;
const COLLAPSE_TO = 110;

/**
 * Pantalla base: fondo oscuro con resplandores, encabezado enorme que se contrae a una barra
 * compacta al hacer scroll, y la píldora de "Salida rápida" siempre visible arriba a la derecha.
 */
export function Screen({
  title,
  subtitle,
  eyebrow,
  nav = false,
  quickExit = true,
  scroll = true,
  footer,
  headerRight,
  children,
  edges = ['top'],
  largeTitle,
  dock = false,
}: Props) {
  const dockInset = useDockInset();
  const NavIcon = nav === 'close' ? X : ChevronLeft;
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.value = e.contentOffset.y;
  });
  const compact = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [COLLAPSE_FROM, COLLAPSE_TO], [0, 1], 'clamp'),
  }));
  const bigTitle = largeTitle ?? (dock || !nav);

  const topBar = (
    <View style={styles.topBar}>
      {title && scroll ? (
        <Animated.View pointerEvents="none" style={[styles.compactBg, compact]}>
          <AppText variant="subheading" numberOfLines={1} style={styles.compactTitle}>
            {title}
          </AppText>
        </Animated.View>
      ) : null}
      {nav ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={nav === 'close' ? 'Cerrar' : 'Regresar'}
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.7 : 1 }]}
        >
          <NavIcon size={20} color={palette.text} strokeWidth={1.9} />
        </Pressable>
      ) : (
        <View />
      )}
      <View style={styles.right}>
        {headerRight}
        {quickExit && <QuickExitButton />}
      </View>
    </View>
  );

  const header = title ? (
    <ScreenHeader eyebrow={eyebrow} title={title} subtitle={subtitle} size={bigTitle ? 'display' : 'hero'} />
  ) : null;

  const bottomPad = dock ? dockInset : spacing.x5;

  return (
    <View style={styles.flex}>
      <Backdrop />
      <SafeAreaView edges={edges} style={styles.flex}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {topBar}
          {scroll ? (
            <Animated.ScrollView
              style={styles.flex}
              contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
            >
              {header}
              {children}
              {dock && footer ? <View style={{ marginTop: spacing.x3 }}>{footer}</View> : null}
            </Animated.ScrollView>
          ) : (
            <View style={[styles.flex, styles.contentStatic, dock && { paddingBottom: dockInset }]}>
              {header}
              {children}
            </View>
          )}
          {!dock && footer ? <View style={styles.footer}>{footer}</View> : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    minHeight: MIN_TOUCH + 8,
    zIndex: 2,
  },
  compactBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: palette.bg1,
    borderBottomWidth: HAIRLINE,
    borderBottomColor: palette.stroke,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 120,
  },
  compactTitle: { textAlign: 'center' },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.glassStrong,
    borderWidth: HAIRLINE,
    borderColor: palette.strokeStrong,
  },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  contentStatic: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: HAIRLINE,
    borderTopColor: palette.stroke,
    backgroundColor: palette.bg1,
    gap: spacing.sm,
  },
});
