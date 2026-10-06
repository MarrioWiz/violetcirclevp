import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { brand, palette } from '@/theme';

/**
 * Símbolo del proyecto: escudo con estrella de cuatro puntas dentro de un círculo
 * formado por dos arcos y dos esferas (protección + círculo de apoyo).
 * Placeholder vectorial; se reemplaza por el logo final del equipo si se desea.
 */
export function Logo({ size = 72, mono }: { size?: number; mono?: boolean }) {
  const ring = mono ? palette.white : brand.ring;
  const star = mono ? palette.violetDeep : brand.star;
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessibilityLabel="Logo de VioletCircleVP">
      <Defs>
        <LinearGradient id="shield" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={mono ? palette.white : brand.shieldTop} />
          <Stop offset="1" stopColor={mono ? brand.monoShieldBottom : brand.shieldBottom} />
        </LinearGradient>
      </Defs>
      <Path
        d="M93.94 26.06 A48 48 0 0 1 47.58 106.36"
        stroke={ring}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M26.06 93.94 A48 48 0 0 1 72.42 13.64" stroke={ring} strokeWidth={6} strokeLinecap="round" fill="none" />
      <Circle cx={84} cy={18.43} r={6.5} fill={mono ? palette.white : brand.sphere} />
      <Circle cx={36} cy={101.57} r={6.5} fill={mono ? palette.white : brand.sphere} />
      <Path d="M60 30 L84 39 V60 C84 76 73 87 60 93 C47 87 36 76 36 60 V39 Z" fill="url(#shield)" />
      <Path d="M60 45 Q62.5 57.5 73 60 Q62.5 62.5 60 75 Q57.5 62.5 47 60 Q57.5 57.5 60 45 Z" fill={star} />
    </Svg>
  );
}
