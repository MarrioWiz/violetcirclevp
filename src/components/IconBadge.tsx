import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { HAIRLINE, alpha, palette, radius, useTheme } from '@/theme';

interface Props {
  icon: LucideIcon;
  size?: number;
  tone?: 'primary' | 'accent' | 'danger' | 'success' | 'warning' | 'onPrimary';
  /** Contenedor redondeado (md) en vez de círculo. */
  square?: boolean;
}

/** Ícono lineal dentro de un contenedor de vidrio tintado. */
export function IconBadge({ icon: Icon, size = 44, tone = 'accent', square = true }: Props) {
  const { colors, accent } = useTheme();
  const fg = {
    primary: colors.primary,
    accent,
    danger: colors.danger,
    success: colors.success,
    warning: colors.warning,
    onPrimary: palette.white,
  }[tone];
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{
        width: size,
        height: size,
        borderRadius: square ? Math.min(radius.md, size / 2.6) : size / 2,
        backgroundColor: tone === 'onPrimary' ? palette.glassStrong : alpha(fg, 0.12),
        borderWidth: HAIRLINE,
        borderColor: tone === 'onPrimary' ? palette.strokeStrong : alpha(fg, 0.22),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={size * 0.48} color={fg} strokeWidth={1.75} />
    </View>
  );
}
