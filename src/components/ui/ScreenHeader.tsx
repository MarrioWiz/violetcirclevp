import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { spacing } from '@/theme';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  accent?: string;
  /** Título gigante (pantallas de pestaña) o grande (pantallas internas). */
  size?: 'display' | 'hero';
}

/** Eyebrow mono con punto del acento + título enorme y apretado + subtítulo lavanda. */
export function ScreenHeader({ eyebrow, title, subtitle, size = 'display' }: Props) {
  return (
    <View style={{ gap: spacing.xs, marginBottom: spacing.xxl }}>
      {eyebrow ? (
        <AppText variant="bodyStrong" style={{ color: 'rgba(255,255,255,0.75)' }}>
          {eyebrow}
        </AppText>
      ) : null}
      <AppText variant={size} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.6} accessibilityRole="header">
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="body" style={{ color: 'rgba(255,255,255,0.72)', marginTop: 2 }}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}
