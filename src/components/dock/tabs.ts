import { CircleDot, Compass, LayoutGrid, MapPinned, Sparkle, type LucideIcon } from 'lucide-react-native';

import type { AccentKey } from '@/theme';

export interface TabMeta {
  route: string;
  label: string;
  icon: LucideIcon;
  accent: AccentKey;
  /** Titular gigante y subtítulo de la pantalla. */
  title: string;
  subtitle: string;
  a11y: string;
}

/** Las 5 pestañas del dock (la alerta rápida NO es pestaña: vive en Inicio). */
export const TAB_META: TabMeta[] = [
  {
    route: 'index',
    label: 'Inicio',
    icon: Sparkle,
    accent: 'inicio',
    title: 'Inicio',
    subtitle: 'Respira. Aquí estás acompañada.',
    a11y: 'Inicio',
  },
  {
    route: 'orientacion',
    label: 'Orienta',
    icon: Compass,
    accent: 'orientacion',
    title: 'Orienta',
    subtitle: 'Entiende lo que pasó, paso a paso.',
    a11y: '¿Esto es violencia digital? Orientación guiada',
  },
  {
    route: 'circulo',
    label: 'Círculo',
    icon: CircleDot,
    accent: 'circulo',
    title: 'Círculo',
    subtitle: 'Tu gente, a un toque.',
    a11y: 'Mi círculo de confianza',
  },
  {
    route: 'directorio',
    label: 'Apoyo',
    icon: MapPinned,
    accent: 'directorio',
    title: 'Apoyo',
    subtitle: 'Ayuda verificada, cerca de ti.',
    a11y: 'Directorio de apoyo',
  },
  {
    route: 'mas',
    label: 'Más',
    icon: LayoutGrid,
    accent: 'mas',
    title: 'Más',
    subtitle: 'Tu espacio, tus reglas.',
    a11y: 'Más opciones y ajustes',
  },
];

export function tabMeta(route: string): TabMeta {
  return TAB_META.find((t) => t.route === route) ?? TAB_META[0];
}
