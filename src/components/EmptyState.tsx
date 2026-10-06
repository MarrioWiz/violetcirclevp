import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { spacing, useTheme } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';
import { IconBadge } from './IconBadge';

interface Props {
  icon: LucideIcon;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Ícono grande en vidrio con halo del acento, título corto, texto amable y una acción. */
export function EmptyState({ icon, title, body, actionLabel, onAction }: Props) {
  const { accent } = useTheme();
  return (
    <View
      style={{ alignItems: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.lg, gap: spacing.md }}
    >
      <View style={{ width: 140, height: 140, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={140} height={140} style={{ position: 'absolute' }} pointerEvents="none">
          <Defs>
            <RadialGradient id="es" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0" stopColor={accent} stopOpacity={0.28} />
              <Stop offset="1" stopColor={accent} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={70} cy={70} r={70} fill="url(#es)" />
        </Svg>
        <IconBadge icon={icon} size={72} />
      </View>
      <AppText variant="heading" center>
        {title}
      </AppText>
      {body ? (
        <AppText tone="textMuted" center>
          {body}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={{ marginTop: spacing.sm, alignSelf: 'stretch' }} />
      ) : null}
    </View>
  );
}
