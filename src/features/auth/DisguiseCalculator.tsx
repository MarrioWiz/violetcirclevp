import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getPinLength, verifyPin } from '@/services/crypto';
import { disguise } from '@/theme';
import { useSession } from '@/store/sessionStore';

type Op = '+' | '−' | '×' | '÷';

function compute(a: number, b: number, op: Op): number {
  switch (op) {
    case '+':
      return a + b;
    case '−':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      return b === 0 ? NaN : a / b;
  }
}

function format(n: number): string {
  if (!Number.isFinite(n)) return 'Error';
  const s = String(Math.round(n * 1e8) / 1e8);
  return s.length > 11 ? n.toExponential(5) : s;
}

/**
 * Pantalla neutra de "Salida rápida": una calculadora que funciona de verdad.
 * Para volver a la app: escribir el PIN y tocar "=".
 * Se dibuja en lugar de toda la navegación, así no existe historial al que regresar.
 */
export function DisguiseCalculator() {
  const leaveDisguise = useSession((s) => s.leaveDisguise);
  const [display, setDisplay] = useState('0');
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [fresh, setFresh] = useState(true);
  const [typed, setTyped] = useState('');

  // En web (PWA) también se disfrazan el título de la pestaña y la URL.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const previous = document.title;
    document.title = 'Calculadora';
    window.history.replaceState(null, '', '/');
    return () => {
      document.title = previous;
    };
  }, []);

  const digit = (d: string) => {
    setTyped((t) => (t + d).slice(-6));
    if (fresh || display === '0') {
      setDisplay(d === '.' ? '0.' : d);
      setFresh(false);
    } else if (!(d === '.' && display.includes('.')) && display.length < 11) {
      setDisplay(display + d);
    }
  };

  const operator = (next: Op) => {
    const value = Number(display);
    if (acc !== null && op && !fresh) {
      const r = compute(acc, value, op);
      setAcc(r);
      setDisplay(format(r));
    } else {
      setAcc(value);
    }
    setOp(next);
    setFresh(true);
    setTyped('');
  };

  const equals = async () => {
    const len = await getPinLength();
    if (typed.length >= len && (await verifyPin(typed.slice(-len)))) {
      setTyped('');
      await leaveDisguise();
      return;
    }
    if (acc !== null && op) {
      const r = compute(acc, Number(display), op);
      setDisplay(format(r));
      setAcc(null);
      setOp(null);
      setFresh(true);
    }
    setTyped('');
  };

  const clear = () => {
    setDisplay('0');
    setAcc(null);
    setOp(null);
    setFresh(true);
    setTyped('');
  };

  const rows: { label: string; kind: 'fn' | 'op' | 'num'; onPress: () => void; wide?: boolean }[][] = [
    [
      { label: 'AC', kind: 'fn', onPress: clear },
      { label: '±', kind: 'fn', onPress: () => setDisplay(format(-Number(display))) },
      { label: '%', kind: 'fn', onPress: () => setDisplay(format(Number(display) / 100)) },
      { label: '÷', kind: 'op', onPress: () => operator('÷') },
    ],
    [
      { label: '7', kind: 'num', onPress: () => digit('7') },
      { label: '8', kind: 'num', onPress: () => digit('8') },
      { label: '9', kind: 'num', onPress: () => digit('9') },
      { label: '×', kind: 'op', onPress: () => operator('×') },
    ],
    [
      { label: '4', kind: 'num', onPress: () => digit('4') },
      { label: '5', kind: 'num', onPress: () => digit('5') },
      { label: '6', kind: 'num', onPress: () => digit('6') },
      { label: '−', kind: 'op', onPress: () => operator('−') },
    ],
    [
      { label: '1', kind: 'num', onPress: () => digit('1') },
      { label: '2', kind: 'num', onPress: () => digit('2') },
      { label: '3', kind: 'num', onPress: () => digit('3') },
      { label: '+', kind: 'op', onPress: () => operator('+') },
    ],
    [
      { label: '0', kind: 'num', onPress: () => digit('0'), wide: true },
      { label: ',', kind: 'num', onPress: () => digit('.') },
      { label: '=', kind: 'op', onPress: () => void equals() },
    ],
  ];

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.displayWrap}>
        <Text style={styles.display} numberOfLines={1} adjustsFontSizeToFit accessibilityLabel={`Resultado ${display}`}>
          {display.replace('.', ',')}
        </Text>
      </View>
      <View style={styles.pad}>
        {rows.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((k) => (
              <Pressable
                key={k.label}
                accessibilityRole="button"
                accessibilityLabel={k.label}
                onPress={k.onPress}
                style={({ pressed }) => [
                  styles.key,
                  k.wide && styles.wide,
                  {
                    backgroundColor: k.kind === 'op' ? disguise.op : k.kind === 'fn' ? disguise.fn : disguise.num,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.keyText,
                    k.kind === 'fn' && { color: disguise.fnText },
                    k.wide && { alignSelf: 'flex-start', paddingLeft: 30 },
                  ]}
                >
                  {k.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const KEY = 78;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: disguise.bg, justifyContent: 'flex-end', paddingBottom: 24 },
  displayWrap: { paddingHorizontal: 24, paddingBottom: 12 },
  display: { color: disguise.text, fontSize: 84, fontWeight: '300', textAlign: 'right' },
  pad: { gap: 14, paddingHorizontal: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  key: { width: KEY, height: KEY, borderRadius: KEY / 2, alignItems: 'center', justifyContent: 'center' },
  wide: { width: KEY * 2 + 14 },
  keyText: { color: disguise.text, fontSize: 34, fontWeight: '400' },
});
