import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react-native';
import { Platform, Pressable, View } from 'react-native';

import { MIN_TOUCH, radius, spacing, useTheme } from '@/theme';

import { AppText } from './AppText';

interface Props {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
}

/** Fecha y hora. iOS: selectores compactos nativos. Android: diálogos nativos. */
export function DateTimeField({ label, value, onChange }: Props) {
  const { colors, scheme } = useTheme();
  const maximumDate = new Date();

  if (Platform.OS === 'ios') {
    return (
      <View style={{ gap: spacing.xs }}>
        <AppText variant="bodyStrong">{label}</AppText>
        <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
          <DateTimePicker
            value={value}
            mode="date"
            display="compact"
            locale="es-MX"
            maximumDate={maximumDate}
            themeVariant={scheme}
            accentColor={colors.primary}
            onChange={(_, d) => d && onChange(d)}
          />
          <DateTimePicker
            value={value}
            mode="time"
            display="compact"
            locale="es-MX"
            themeVariant={scheme}
            accentColor={colors.primary}
            onChange={(_, d) => d && onChange(d)}
          />
        </View>
      </View>
    );
  }

  const open = (mode: 'date' | 'time') => {
    if (Platform.OS !== 'android') return;
    DateTimePickerAndroid.open({
      value,
      mode,
      is24Hour: true,
      maximumDate: mode === 'date' ? maximumDate : undefined,
      onChange: (e, d) => {
        if (e.type === 'set' && d) onChange(d);
      },
    });
  };

  return (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="bodyStrong">{label}</AppText>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <PickerButton mode="date" value={value} onPress={() => open('date')} />
        <PickerButton mode="time" value={value} onPress={() => open('time')} />
      </View>
    </View>
  );
}

function PickerButton({ mode, value, onPress }: { mode: 'date' | 'time'; value: Date; onPress: () => void }) {
  const { colors } = useTheme();
  const Icon = mode === 'date' ? Calendar : Clock;
  const text = mode === 'date' ? format(value, "d 'de' MMM yyyy", { locale: es }) : format(value, 'HH:mm');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${mode === 'date' ? 'Fecha' : 'Hora'}: ${text}`}
      onPress={onPress}
      disabled={Platform.OS === 'web'}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: MIN_TOUCH,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
    >
      <Icon size={18} color={colors.primary} />
      <AppText>{text}</AppText>
    </Pressable>
  );
}
