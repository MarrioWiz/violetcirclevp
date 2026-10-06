export type ColorScheme = 'light' | 'dark';

export interface Palette {
  primary: string;
  primaryDark: string;
  primarySoft: string;
  accent: string;
  onPrimary: string;
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  danger: string;
  dangerSoft: string;
  onDanger: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  shadow: string;
  overlay: string;
}

// Contraste verificado contra WCAG AA (≥ 4.5:1 para texto normal).
export const light: Palette = {
  primary: '#6D28D9',
  primaryDark: '#4C1D95',
  primarySoft: '#EDE9FE',
  accent: '#A78BFA',
  onPrimary: '#FFFFFF',
  bg: '#FAF7FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F4EFFE',
  border: '#E6DFF7',
  text: '#1F1635',
  textMuted: '#5B5170',
  danger: '#B42318',
  dangerSoft: '#FEF3F2',
  onDanger: '#FFFFFF',
  success: '#1F7A4D',
  successSoft: '#E8F6EE',
  warning: '#B54708',
  warningSoft: '#FFF6E8',
  shadow: '#4C1D95',
  overlay: 'rgba(20,16,31,0.45)',
};

export const dark: Palette = {
  primary: '#A78BFA',
  primaryDark: '#C4B5FD',
  primarySoft: '#2B2145',
  accent: '#8B5CF6',
  onPrimary: '#14101F',
  bg: '#14101F',
  surface: '#1E1830',
  surfaceAlt: '#262038',
  border: '#352C4E',
  text: '#F3EEFF',
  textMuted: '#B8AECF',
  danger: '#F97066',
  dangerSoft: '#3A1A1E',
  onDanger: '#14101F',
  success: '#4ADE80',
  successSoft: '#16291F',
  warning: '#FDB022',
  warningSoft: '#2E2414',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.6)',
};

export const palettes: Record<ColorScheme, Palette> = { light, dark };
