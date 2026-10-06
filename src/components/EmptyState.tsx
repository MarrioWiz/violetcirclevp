import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { spacing } from '@/theme';

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

export function EmptyState({ icon, title, body, actionLabel, onAction }: Props) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.lg, gap: spacing.md }}>
      <IconBadge icon={icon} size={72} />
      <AppText variant="heading" center>
        {title}
      </AppText>
      {body ? (
        <AppText tone="textMuted" center>
          {body}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" style={{ marginTop: spacing.sm, alignSelf: 'stretch' }} />
      ) : null}
    </View>
  );
}
