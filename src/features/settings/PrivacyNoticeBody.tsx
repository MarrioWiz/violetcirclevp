import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { bundled } from '@/features/content/repository';
import { spacing } from '@/theme';

export function PrivacyNoticeBody() {
  const { privacy } = bundled.legal;
  return (
    <View style={{ gap: spacing.lg }}>
      {privacy.sections.map((s) => (
        <View key={s.heading} style={{ gap: spacing.xs }}>
          <AppText variant="subheading" accessibilityRole="header">
            {s.heading}
          </AppText>
          <AppText tone="textMuted">{s.body}</AppText>
        </View>
      ))}
      <AppText variant="caption" tone="textMuted">
        Actualizado: {privacy.updated}
      </AppText>
    </View>
  );
}
