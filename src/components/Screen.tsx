import { router, usePathname } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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

/**
 * Texto del botón de regresar según la pantalla ("‹ Más"), para saber siempre a dónde vuelves.
 * Solo donde el origen es uno solo; si se puede llegar desde varios lados, dice "Atrás".
 */
const BACK_LABELS: [RegExp, string][] = [
  [/^\/bitacora\/(nueva|exportar)$/, 'Mis registros'],
  [/^\/bitacora\/[^/]+$/, 'Mis registros'],
  [/^\/bitacora$/, 'Más'],
  [/^\/biblioteca$/, 'Más'],
  [/^\/ajustes\/ayuda-rapida$/, 'Más'],
  [/^\/ajustes\/pin$/, 'Ajustes'],
  [/^\/ajustes$/, 'Más'],
  [/^\/info\//, 'Ajustes'],
  [/^\/aprende\//, 'Biblioteca'],
  [/^\/circulo\/acompanar$/, 'Biblioteca'],
  [/^\/directorio\//, 'Apoyo'],
];

export function backLabelFor(pathname: string): string {
  return BACK_LABELS.find(([re]) => re.test(pathname))?.[1] ?? 'Atrás';
}

/**
 * Pantalla base: fondo con aurora, título grande que se desplaza con el contenido (sin barra
 * que aparezca al hacer scroll) y la píldora de "Salida rápida" siempre visible arriba a la derecha.
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
  const pathname = usePathname();
  const NavIcon = nav === 'close' ? X : ChevronLeft;
  const bigTitle = largeTitle ?? (dock || !nav);

  const topBar = (
    <View style={styles.topBar}>
      {nav ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={nav === 'close' ? 'Cerrar' : `Regresar a ${backLabelFor(pathname)}`}
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={({ pressed }) => [nav === 'close' ? styles.closeBtn : styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <NavIcon size={nav === 'close' ? 20 : 24} color={palette.text} strokeWidth={2.2} />
          {nav === 'back' ? (
            <AppText variant="bodyStrong" numberOfLines={1}>
              {backLabelFor(pathname)}
            </AppText>
          ) : null}
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

  // En pestañas también se deja lugar para el botón de Vi (abajo a la derecha, sobre el dock).
  const bottomPad = dock ? dockInset + 64 : spacing.x5 + 64;

  return (
    <View style={styles.flex}>
      <Backdrop />
      <SafeAreaView edges={edges} style={styles.flex}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {topBar}
          {scroll ? (
            <ScrollView
              style={styles.flex}
              contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {header}
              {children}
              {dock && footer ? <View style={{ marginTop: spacing.x3 }}>{footer}</View> : null}
            </ScrollView>
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
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 40, paddingRight: spacing.sm, marginLeft: -6 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.glassStrong,
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
