/** Escala de 4: 4 8 12 16 20 24 32 40 56. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  x3: 32,
  xxxl: 40,
  x5: 56,
} as const;

/** Radios: usar concéntricos (radio interno = radio externo − padding). */
export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

/** Un solo tipo de borde: 1 px translúcido. */
export const HAIRLINE = 1;

/** Área táctil mínima (Human Interface Guidelines: 44 pt). */
export const MIN_TOUCH = 48;
