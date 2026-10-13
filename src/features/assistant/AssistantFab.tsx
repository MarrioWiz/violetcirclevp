import { router, usePathname } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DOCK } from '@/components/dock/useDockInset';
import { palette } from '@/theme';

import { ViAvatar } from './ViAvatar';

const SIZE = 56;
const GLOW = SIZE * 1.9;

/** Pestañas del dock (ahí el botón va encima del dock). */
const TAB_PATHS = new Set(['/', '/orientacion', '/circulo', '/directorio', '/mas']);
/** Pantallas con botones fijos abajo: el botón sube para no taparlos. */
const FOOTER_PATHS = ['/bitacora', '/circulo/acompanar'];
/** Donde estorbaría: el propio chat, formularios con teclado y la alerta. */
const HIDDEN = ['/asistente', '/alerta', '/circulo/nuevo', '/bitacora/nueva', '/ajustes/pin', '/aprende/autoevaluacion'];

export function fabBottom(pathname: string, safeBottom: number): number | null {
  if (HIDDEN.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  if (TAB_PATHS.has(pathname)) return DOCK.H + safeBottom + 8 + 12;
  if (FOOTER_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return safeBottom + 112;
  return safeBottom + 20;
}

/**
 * Circulito de Vi, abajo a la derecha en todas las pantallas de la app.
 * No tapa el dock, el orbe (centro), la salida rápida (arriba) ni la franja del 911.
 */
export function AssistantFab() {
  const pathname = usePathname();
  const { bottom: safeBottom } = useSafeAreaInsets();
  const bottom = fabBottom(pathname, Math.max(safeBottom, Platform.OS === 'web' ? 8 : 0));
  if (bottom === null) return null;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      <Svg width={GLOW} height={GLOW} style={styles.glow} pointerEvents="none">
        <Defs>
          <RadialGradient id="viGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={palette.violet} stopOpacity={0.35} />
            <Stop offset="1" stopColor={palette.violet} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={GLOW / 2} cy={GLOW / 2} r={GLOW / 2} fill="url(#viGlow)" />
      </Svg>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Hablar con Vi, tu asistente"
        accessibilityHint="Abre un chat con respuestas automáticas"
        hitSlop={6}
        onPress={() => router.push('/asistente')}
        style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.94 : 1 }] })}
      >
        <ViAvatar size={SIZE} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 16, width: SIZE, height: SIZE, zIndex: 20 },
  glow: { position: 'absolute', left: (SIZE - GLOW) / 2, top: (SIZE - GLOW) / 2 },
});
