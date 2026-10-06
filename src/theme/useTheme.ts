import { create } from 'zustand';

import { useSettings } from '@/store/settingsStore';

import { accents, palettes, type AccentKey, type ColorScheme, type Palette } from './colors';

/** Acento de la sección activa (lo fija el dock al cambiar de pestaña). */
export const useAccentStore = create<{ key: AccentKey; setKey: (k: AccentKey) => void }>((set) => ({
  key: 'inicio',
  setKey: (key) => set({ key }),
}));

export interface Theme {
  scheme: ColorScheme;
  colors: Palette;
  textScale: number;
  /** Color de acento de la sección actual. */
  accent: string;
  accentKey: AccentKey;
}

/** Un solo tema (oscuro). Ver docs/DISENO.md. */
export function useTheme(): Theme {
  const textScale = useSettings((s) => s.textScale);
  const accentKey = useAccentStore((s) => s.key);
  return { scheme: 'dark', colors: palettes.dark, textScale, accent: accents[accentKey], accentKey };
}
