import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { palette, useTheme } from '@/theme';

/**
 * Fondo ambiental: base casi negra, radial violeta muy sutil arriba y un resplandor
 * del acento de la sección abajo. Estático (sin animación) para no gastar batería.
 */
export function Backdrop({ accent: accentProp, bottomGlow = true }: { accent?: string; bottomGlow?: boolean }) {
  const { width, height } = useWindowDimensions();
  const { accent } = useTheme();
  const glow = accentProp ?? accent;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: palette.bg0 }]}>
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="top" cx="50%" cy="0%" rx="70%" ry="45%" fx="50%" fy="0%">
            <Stop offset="0" stopColor={palette.violetHalo} stopOpacity={0.55} />
            <Stop offset="1" stopColor={palette.violetHalo} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="bottom" cx="50%" cy="100%" rx="60%" ry="30%" fx="50%" fy="100%">
            <Stop offset="0" stopColor={glow} stopOpacity={0.18} />
            <Stop offset="1" stopColor={glow} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={width / 2} cy={0} rx={width * 0.85} ry={height * 0.45} fill="url(#top)" />
        {bottomGlow && <Ellipse cx={width / 2} cy={height} rx={width * 0.75} ry={height * 0.3} fill="url(#bottom)" />}
      </Svg>
    </View>
  );
}
