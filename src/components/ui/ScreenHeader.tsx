import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { spacing, useTheme } from '@/theme';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  accent?: string;
  /** Título gigante (pantallas de pestaña) o grande (pantallas internas). */
  size?: 'display' | 'hero';
}

/** Eyebrow mono con punto del acento + título enorme y apretado + subtítulo lavanda. */
export function ScreenHeader({
  eyebrow = 'VioletCircleVP',
  title,
  subtitle,
  accent: accentProp,
  size = 'display',
}: Props) {
  const { accent } = useTheme();
  const dot = accentProp ?? accent;
  return (
    <View style={{ gap: spacing.sm, marginBottom: spacing.xxl }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }} accessibilityElementsHidden>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} />
        <AppText variant="label" tone="textMuted">
          {eyebrow}
        </AppText>
      </View>
      <AppText variant={size} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.6} accessibilityRole="header">
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="subtitle" tone="textMuted">
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}
