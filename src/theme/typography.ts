import type { TextStyle } from 'react-native';

export const fonts = {
  display: 'Inter_800ExtraBold',
  bold: 'Inter_700Bold',
  semi: 'Inter_600SemiBold',
  medium: 'Inter_500Medium',
  body: 'Inter_400Regular',
  mono: 'JetBrainsMono_500Medium',
  // Alias usados por componentes existentes.
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
} as const;

export type TextVariant =
  | 'display'
  | 'hero'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'subtitle'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label'
  | 'mono';

const track = (size: number, em: number) => size * em;

export const typeScale: Record<TextVariant, TextStyle> = {
  // Títulos gigantes del encabezado: ultra-bold y tracking apretado (−4 %).
  display: { fontFamily: fonts.display, fontSize: 48, lineHeight: 50, letterSpacing: track(48, -0.04) },
  hero: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38, letterSpacing: track(34, -0.035) },
  title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 31, letterSpacing: track(26, -0.02) },
  heading: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26, letterSpacing: track(20, -0.015) },
  subheading: { fontFamily: fonts.semi, fontSize: 16, lineHeight: 22 },
  subtitle: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 25 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.semi, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  // Eyebrows / etiquetas / metadatos: mono en mayúsculas con mucho espaciado.
  label: { fontFamily: fonts.mono, fontSize: 11, lineHeight: 16, letterSpacing: 3, textTransform: 'uppercase' },
  mono: { fontFamily: fonts.mono, fontSize: 12, lineHeight: 18, letterSpacing: 0.5 },
};
