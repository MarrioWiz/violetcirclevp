import type { TextStyle } from 'react-native';

export const fonts = {
  display: 'PlusJakartaSans_700Bold',
  displaySemi: 'PlusJakartaSans_600SemiBold',
  displayExtra: 'PlusJakartaSans_800ExtraBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
} as const;

export type TextVariant = 'hero' | 'title' | 'heading' | 'subheading' | 'body' | 'bodyStrong' | 'caption' | 'label';

export const typeScale: Record<TextVariant, TextStyle> = {
  hero: { fontFamily: fonts.displayExtra, fontSize: 30, lineHeight: 38, letterSpacing: -0.5 },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 31, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.display, fontSize: 19, lineHeight: 26 },
  subheading: { fontFamily: fonts.displaySemi, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.bodySemi, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.bodySemi, fontSize: 12, lineHeight: 16, letterSpacing: 0.6, textTransform: 'uppercase' },
};
