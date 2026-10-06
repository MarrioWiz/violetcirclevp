import { useColorScheme } from 'react-native';

import { useSettings } from '@/store/settingsStore';

import { palettes, type ColorScheme, type Palette } from './colors';

export interface Theme {
  scheme: ColorScheme;
  colors: Palette;
  textScale: number;
}

export function useTheme(): Theme {
  const system = useColorScheme();
  const pref = useSettings((s) => s.theme);
  const textScale = useSettings((s) => s.textScale);
  const scheme: ColorScheme = pref === 'system' ? (system === 'dark' ? 'dark' : 'light') : pref;
  return { scheme, colors: palettes[scheme], textScale };
}
