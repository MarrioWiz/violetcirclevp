import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { alpha, palette } from '@/theme';

/** Brillo interno superior de 1 px que da el aspecto de vidrio. Va dentro de una superficie redondeada. */
export function Sheen({ inset = 16, color }: { inset?: number; color?: string }) {
  const c = color ? alpha(color, 0.35) : palette.sheen;
  return (
    <LinearGradient
      pointerEvents="none"
      colors={['transparent', c, 'transparent']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.line, { left: inset, right: inset }]}
    />
  );
}

const styles = StyleSheet.create({
  line: { position: 'absolute', top: 0, height: 1 },
});
