import type { DirectoryEntry, DirectoryType } from '@/types';

export const PENDING = 'PENDIENTE_DE_VERIFICAR';

export const DIRECTORY_TYPES: DirectoryType[] = [
  'emergencia',
  'policia',
  'mujeres',
  'psicologico',
  'juridico',
  'uvp',
  'plataformas',
];

function hasPendingField(e: DirectoryEntry): boolean {
  return Object.values(e).some((v) => typeof v === 'string' && v.includes(PENDING));
}

/**
 * Regla de oro del directorio: solo se muestra lo verificado.
 * Además de `verified === true`, se descarta cualquier entrada con un campo
 * "PENDIENTE_DE_VERIFICAR" o sin fuente, por si alguien marcó verified por error.
 */
export function isPublishable(e: DirectoryEntry): boolean {
  return e.verified === true && !hasPendingField(e) && Boolean(e.source) && Boolean(e.verifiedAt);
}

export function visibleEntries(entries: DirectoryEntry[], type?: DirectoryType | 'all'): DirectoryEntry[] {
  return entries
    .filter(isPublishable)
    .filter((e) => !type || type === 'all' || e.type === type)
    .sort(
      (a, b) => DIRECTORY_TYPES.indexOf(a.type) - DIRECTORY_TYPES.indexOf(b.type) || a.name.localeCompare(b.name, 'es'),
    );
}

export function pendingCount(entries: DirectoryEntry[]): number {
  return entries.filter((e) => !isPublishable(e)).length;
}
