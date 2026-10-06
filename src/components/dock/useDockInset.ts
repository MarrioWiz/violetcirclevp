import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const DOCK = {
  H: 62,
  R: 22,
  bead: 24,
  gap: 4,
  fillet: 10,
  side: 16,
} as const;

/** Espacio inferior que deben dejar las pantallas con scroll para que el dock no tape contenido. */
export function useDockInset(): number {
  const { bottom } = useSafeAreaInsets();
  return DOCK.H + bottom + 8 + 24;
}
