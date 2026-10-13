import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { MAX_CONTACTS, useCircle } from '@/store/circleStore';
import { HAIRLINE, alpha, palette } from '@/theme';

const SAT = 34;
const STEP_DEG = 32;

/**
 * Tu círculo como "satélites" en la órbita del orbe: se ve de un vistazo a quién le llega la alerta.
 * Si hay lugar, un satélite vacío (+) invita a agregar a alguien.
 */
export function OrbitSatellites({ size }: { size: number }) {
  const contacts = useCircle((s) => s.contacts);
  const slots: ({ id: string; name: string } | 'add')[] = [...contacts.slice(0, MAX_CONTACTS)];
  if (contacts.length < MAX_CONTACTS) slots.push('add');

  const c = size / 2;
  const r = size / 2 + 2;
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {slots.map((slot, i) => {
        const deg = -90 + (i - (slots.length - 1) / 2) * STEP_DEG;
        const rad = (deg * Math.PI) / 180;
        const left = c + r * Math.cos(rad) - SAT / 2;
        const top = c + r * Math.sin(rad) - SAT / 2;
        if (slot === 'add') {
          return (
            <Pressable
              key="add"
              accessibilityRole="button"
              accessibilityLabel="Agregar a alguien a tu círculo"
              hitSlop={8}
              onPress={() => router.push('/circulo/nuevo')}
              style={({ pressed }) => [styles.add, { left, top, opacity: pressed ? 0.7 : 1 }]}
            >
              <Plus size={16} color={palette.textMuted} strokeWidth={2} />
            </Pressable>
          );
        }
        return (
          <View key={slot.id} style={[styles.sat, { left, top }]} accessible accessibilityLabel={slot.name}>
            <Avatar name={slot.name} size={SAT} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sat: {
    position: 'absolute',
    width: SAT + 4,
    height: SAT + 4,
    margin: -2,
    borderRadius: (SAT + 4) / 2,
    borderWidth: 2,
    borderColor: palette.bg0,
  },
  add: {
    position: 'absolute',
    width: SAT,
    height: SAT,
    borderRadius: SAT / 2,
    borderWidth: HAIRLINE,
    borderStyle: 'dashed',
    borderColor: alpha(palette.text, 0.35),
    backgroundColor: palette.bg1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
