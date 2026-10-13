import { LogOut } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { S } from '@/lib/strings.es';
import { HAIRLINE, alpha, disguise, fonts, palette, radius, spacing, useTheme } from '@/theme';

const KEYS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
];

/** Mini calculadora decorativa: muestra el PIN tecleado y el "=" resaltado. */
function MiniCalculator() {
  return (
    <View style={styles.calc} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text style={styles.calcDisplay}>••••</Text>
      <View style={{ gap: 5 }}>
        {KEYS.map((row) => (
          <View key={row.join('')} style={{ flexDirection: 'row', gap: 5 }}>
            {row.map((k) => (
              <View key={k} style={[styles.key, { backgroundColor: disguise.num }]}>
                <Text style={styles.keyText}>{k}</Text>
              </View>
            ))}
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: 5 }}>
          <View style={[styles.key, { flex: 2, backgroundColor: disguise.num }]}>
            <Text style={styles.keyText}>0</Text>
          </View>
          <View style={[styles.key, styles.equals]}>
            <Text style={styles.keyText}>=</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/** Píldora de "Salida rápida" tal como se ve arriba a la derecha. */
function PillMock() {
  return (
    <View style={styles.pill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <LogOut size={14} color={palette.text} strokeWidth={1.9} />
      <AppText variant="label" style={{ color: palette.text, letterSpacing: 1, fontSize: 10 }}>
        {S.quickExit.label}
      </AppText>
    </View>
  );
}

/** Explicación de la salida rápida: 3 pasos en línea de tiempo + ilustración. */
export function QuickExitGuide() {
  const { accent } = useTheme();
  const steps = S.quickExitGuide.steps;
  return (
    <View style={{ gap: spacing.xl }}>
      <View style={styles.visual}>
        <PillMock />
        <View style={[styles.arrow, { backgroundColor: alpha(accent, 0.5) }]} />
        <MiniCalculator />
      </View>

      <View>
        {steps.map((s, i) => (
          <View key={s.title} style={styles.step}>
            <View style={styles.rail}>
              <View style={[styles.node, { borderColor: alpha(accent, 0.6), backgroundColor: alpha(accent, 0.16) }]}>
                <AppText variant="mono" style={{ color: accent }}>
                  {i + 1}
                </AppText>
              </View>
              {i < steps.length - 1 && <View style={styles.line} />}
            </View>
            <View style={{ flex: 1, paddingBottom: spacing.xl, gap: 2 }}>
              <AppText variant="subheading">{s.title}</AppText>
              <AppText variant="caption" tone="textMuted">
                {s.body}
              </AppText>
            </View>
          </View>
        ))}
      </View>

      <AppText variant="caption" tone="textMuted">
        {S.quickExitGuide.note}
      </AppText>
    </View>
  );
}

const KEY = 26;

const styles = StyleSheet.create({
  visual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: HAIRLINE,
    borderColor: palette.stroke,
    backgroundColor: palette.glass,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: palette.glassStrong,
    borderWidth: HAIRLINE,
    borderColor: palette.strokeStrong,
  },
  arrow: { width: 24, height: 2, borderRadius: 1 },
  calc: { backgroundColor: disguise.bg, padding: 8, borderRadius: radius.md, gap: 6 },
  calcDisplay: { color: disguise.text, fontSize: 18, textAlign: 'right', fontFamily: fonts.medium, letterSpacing: 2 },
  key: { width: KEY, height: KEY, borderRadius: KEY / 2, alignItems: 'center', justifyContent: 'center' },
  keyText: { color: disguise.text, fontSize: 12, fontFamily: fonts.medium },
  equals: { backgroundColor: disguise.op, borderWidth: 2, borderColor: disguise.text },
  step: { flexDirection: 'row', gap: spacing.md },
  rail: { alignItems: 'center', width: 32 },
  node: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: HAIRLINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { flex: 1, width: HAIRLINE, backgroundColor: palette.strokeStrong, marginVertical: 4 },
});
