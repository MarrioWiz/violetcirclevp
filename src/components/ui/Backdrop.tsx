import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { palette, useTheme } from '@/theme';

/**
 * Fondo: base casi negra con una "aurora" de color vivo arriba (violeta + el color de la
 * sección), como el fondo de color de las apps de banca modernas. Se desvanece hacia abajo
 * para que el contenido quede sobre negro limpio. Estático (sin animación).
 */
export function Backdrop({ accent: accentProp }: { accent?: string; bottomGlow?: boolean }) {
  const { width, height } = useWindowDimensions();
  const { accent } = useTheme();
  const second = accentProp ?? accent;
  const h = Math.min(height, 900);
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: palette.bg0 }]}>
      <Svg width={width} height={h}>
        <Defs>
          <RadialGradient id="auroraA" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={palette.violet} stopOpacity={0.75} />
            <Stop offset="1" stopColor={palette.violet} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="auroraB" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={second} stopOpacity={0.6} />
            <Stop offset="1" stopColor={second} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="auroraC" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={palette.violetDeep} stopOpacity={0.45} />
            <Stop offset="1" stopColor={palette.violetDeep} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={width * 0.12} cy={h * 0.02} rx={width * 0.75} ry={h * 0.28} fill="url(#auroraA)" />
        <Ellipse cx={width * 0.95} cy={h * 0.08} rx={width * 0.6} ry={h * 0.25} fill="url(#auroraB)" />
        <Ellipse cx={width * 0.5} cy={h * 0.24} rx={width * 0.7} ry={h * 0.18} fill="url(#auroraC)" />
      </Svg>
    </View>
  );
}
