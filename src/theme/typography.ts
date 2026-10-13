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
  // Títulos grandes, pesados y apretados (estilo banca móvil moderna).
  display: { fontFamily: fonts.display, fontSize: 40, lineHeight: 46, letterSpacing: track(40, -0.035) },
  hero: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: track(30, -0.03) },
  title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, letterSpacing: track(24, -0.02) },
  heading: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 25, letterSpacing: track(19, -0.01) },
  subheading: { fontFamily: fonts.semi, fontSize: 16, lineHeight: 22 },
  subtitle: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 25 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.semi, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  // Etiquetas: texto normal, semibold y pequeño (sin mayúsculas espaciadas).
  label: { fontFamily: fonts.semi, fontSize: 13, lineHeight: 18 },
  mono: { fontFamily: fonts.mono, fontSize: 12, lineHeight: 18, letterSpacing: 0.5 },
};
