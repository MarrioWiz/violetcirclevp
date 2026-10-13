// Sistema visual "dock líquido": oscuro, vidrio y brillo, con acento por sección.
// Este es el ÚNICO archivo con colores literales de la app.

export type ColorScheme = 'dark';

/** Tokens base (ver docs/DISENO.md). */
export const palette = {
  // Paleta "aurora violeta" (2026-10-12): índigo profundo, orquídea y periwinkle.
  bg0: '#130E24',
  bg1: '#1A1430',
  bg2: '#231B3D',
  glass: 'rgba(255,255,255,0.04)',
  glassStrong: 'rgba(255,255,255,0.07)',
  stroke: 'rgba(255,255,255,0.08)',
  strokeStrong: 'rgba(255,255,255,0.14)',
  sheen: 'rgba(255,255,255,0.14)',
  text: '#F1ECFA',
  textMuted: '#ADA3C9',
  textFaint: '#71688F', // solo decorativo
  violet: '#A97BEA',
  violetLight: '#C9A8F7',
  violetDeep: '#7A5BD6',
  violetHalo: '#2D2152',
  danger: '#F0627D', // SOLO 911 / destructivo
  success: '#86CFAF',
  warning: '#E5C47A',
  white: '#FFFFFF',
  black: '#000000',
  beadRim: 'rgba(255,255,255,0.35)',
  beadShine: 'rgba(255,255,255,0.45)',
} as const;

/** Acento por sección: el dock y el encabezado se tiñen con él. */
export const accents = {
  inicio: '#C9A8F7',
  orientacion: '#9DB2F7',
  circulo: '#F2A9D4',
  directorio: '#8FDACF',
  mas: '#F4C690',
} as const;

export type AccentKey = keyof typeof accents;

/** Convierte #RRGGBB a rgba con opacidad (para tintes y halos). */
export function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Nombres semánticos que usan los componentes (compatibles con los de antes). */
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
  borderStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
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

export const dark: Palette = {
  primary: palette.violetLight,
  primaryDark: '#E7DAFD',
  primarySoft: alpha(palette.violet, 0.16),
  accent: accents.inicio,
  onPrimary: palette.white,
  bg: palette.bg0,
  surface: palette.glass,
  surfaceAlt: palette.glassStrong,
  border: palette.stroke,
  borderStrong: palette.strokeStrong,
  text: palette.text,
  textMuted: palette.textMuted,
  textFaint: palette.textFaint,
  danger: palette.danger,
  dangerSoft: alpha(palette.danger, 0.12),
  onDanger: '#FFFFFF',
  success: palette.success,
  successSoft: alpha(palette.success, 0.12),
  warning: palette.warning,
  warningSoft: alpha(palette.warning, 0.12),
  shadow: palette.black,
  overlay: 'rgba(0,0,0,0.6)',
};

export const palettes: Record<ColorScheme, Palette> = { dark };

/** Marca (logo e íconos generados). */
export const brand = {
  ring: palette.violetLight,
  sphere: '#C4B5FD',
  shieldTop: '#8B5CF6',
  shieldBottom: '#4C1D95',
  star: palette.white,
  monoShieldBottom: '#EDE9FE',
  coverBg: '#120A22',
} as const;

/** Gradientes de acciones destacadas. */
export const gradients = {
  primary: [palette.violetLight, palette.violetDeep] as const,
  orb: ['#DCC2FB', '#A97BEA', '#7F8FF2'] as const,
  sosBg: ['#251A45', palette.bg0] as const,
} as const;

/**
 * Pantalla neutra de "Salida rápida": NO usa el estilo de la app (debe parecer otra cosa).
 * Colores de una calculadora genérica.
 */
export const disguise = {
  bg: '#000000',
  text: '#FFFFFF',
  num: '#333333',
  fn: '#A5A5A5',
  fnText: '#000000',
  op: '#FF9F0A',
} as const;
