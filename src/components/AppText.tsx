import { Text, type TextProps } from 'react-native';

import { typeScale, useTheme, type Palette, type TextVariant } from '@/theme';

export type TextTone = keyof Pick<
  Palette,
  | 'text'
  | 'textMuted'
  | 'textFaint'
  | 'primary'
  | 'primaryDark'
  | 'danger'
  | 'onPrimary'
  | 'onDanger'
  | 'success'
  | 'warning'
>;

interface Props extends TextProps {
  variant?: TextVariant;
  tone?: TextTone;
  /** Usa el color de acento de la sección actual. */
  accent?: boolean;
  center?: boolean;
}

const BIG: TextVariant[] = ['display', 'hero', 'title'];

/** Texto base: tipografía del sistema visual, color del tema y tamaño elegido en Ajustes. Respeta Dynamic Type. */
export function AppText({ variant = 'body', tone = 'text', accent: useAccent, center, style, ...rest }: Props) {
  const { colors, textScale, accent } = useTheme();
  const base = typeScale[variant];
  return (
    <Text
      maxFontSizeMultiplier={BIG.includes(variant) ? 1.3 : 2}
      style={[
        base,
        {
          color: useAccent ? accent : colors[tone],
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
