import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { HAIRLINE, gradients, palette } from '@/theme';

/** Avatar de Vi: la misma esfera del orbe "Pedir ayuda", en pequeño. */
export function ViAvatar({ size = 36 }: { size?: number }) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <LinearGradient colors={gradients.orb} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill}>
        <LinearGradient
          colors={[palette.beadShine, 'transparent']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.6, y: 0.7 }}
          style={StyleSheet.absoluteFill}
        />
        <Sparkles size={size * 0.46} color={palette.white} strokeWidth={1.75} />
      </LinearGradient>
      <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, borderWidth: HAIRLINE, borderColor: palette.beadRim }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
