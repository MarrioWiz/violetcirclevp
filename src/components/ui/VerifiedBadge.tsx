import { BadgeCheck } from 'lucide-react-native';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { alpha, palette, radius, spacing } from '@/theme';

/** Píldora menta "Verificado" (directorio). */
export function VerifiedBadge({ date }: { date?: string }) {
  return (
    <View
      accessibilityLabel={date ? `Verificado el ${date}` : 'Verificado'}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderRadius: radius.pill,
        backgroundColor: alpha(palette.success, 0.15),
      }}
    >
      <BadgeCheck size={14} color={palette.success} />
      <AppText variant="mono" style={{ color: palette.success, fontSize: 11 }}>
        {date ? `VERIFICADO · ${date}` : 'VERIFICADO'}
      </AppText>
    </View>
  );
}
