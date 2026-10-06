import { Text, type TextProps } from 'react-native';

import { typeScale, useTheme, type Palette, type TextVariant } from '@/theme';

export type TextTone = keyof Pick<
  Palette,
  'text' | 'textMuted' | 'primary' | 'primaryDark' | 'danger' | 'onPrimary' | 'onDanger' | 'success' | 'warning'
>;

interface Props extends TextProps {
  variant?: TextVariant;
  tone?: TextTone;
  center?: boolean;
}

/** Texto base: aplica tipografía, color del tema y el tamaño elegido en Ajustes. Respeta Dynamic Type. */
export function AppText({ variant = 'body', tone = 'text', center, style, ...rest }: Props) {
  const { colors, textScale } = useTheme();
  const base = typeScale[variant];
  return (
    <Text
      maxFontSizeMultiplier={variant === 'hero' || variant === 'title' ? 1.5 : 2}
      style={[
        base,
        {
          color: colors[tone],
          fontSize: (base.fontSize ?? 16) * textScale,
          lineHeight: (base.lineHeight ?? 22) * textScale,
        },
        center && { textAlign: 'center' },
        style,
      ]}
      {...rest}
    />
  );
}
