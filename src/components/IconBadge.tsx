import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { useTheme } from '@/theme';

interface Props {
  icon: LucideIcon;
  size?: number;
  tone?: 'primary' | 'danger' | 'success' | 'warning' | 'onPrimary';
}

/** Ícono lineal dentro de un círculo suave. */
export function IconBadge({ icon: Icon, size = 44, tone = 'primary' }: Props) {
  const { colors } = useTheme();
  const map = {
    primary: { bg: colors.primarySoft, fg: colors.primary },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
    success: { bg: colors.successSoft, fg: colors.success },
    warning: { bg: colors.warningSoft, fg: colors.warning },
    onPrimary: { bg: 'rgba(255,255,255,0.18)', fg: '#FFFFFF' },
  }[tone];
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: map.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={size * 0.5} color={map.fg} strokeWidth={1.8} />
    </View>
  );
}
