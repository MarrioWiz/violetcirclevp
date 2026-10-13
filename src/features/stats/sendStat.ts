import { addDoc, collection } from 'firebase/firestore';

import { ensureAnonymousSession, getDb } from '@/services/firebase';
import { useSettings } from '@/store/settingsStore';
import type { Platform, ViolenceKind } from '@/types';

import { isoWeek } from './isoWeek';

const PLATFORMS: Platform[] = ['whatsapp', 'instagram', 'tiktok', 'facebook', 'otra'];

/** Construye el documento anónimo: solo { kind, platform, week }. */
export function buildStat(kind: ViolenceKind, platform: string | undefined, date = new Date()) {
  const p: Platform = PLATFORMS.includes(platform as Platform) ? (platform as Platform) : 'otra';
  // Las reglas de Firestore aún no conocen 'presencial': se cuenta como 'otro' (sin perder privacidad).
  return { kind: kind === 'presencial' ? 'otro' : kind, platform: p, week: isoWeek(date) };
}

/**
 * Solo si ella lo activó. Sin UID, sin ubicación, sin texto libre.
 * Los errores se ignoran en silencio: nunca debe interrumpir su experiencia.
 */
export async function sendAnonymousStat(kind: ViolenceKind, platform: string | undefined): Promise<void> {
  if (!useSettings.getState().statsOptIn) return;
  const db = getDb();
  if (!db) return;
  try {
    if (!(await ensureAnonymousSession())) return;
    await addDoc(collection(db, 'stats'), buildStat(kind, platform));
  } catch {
    // sin conexión o reglas: no pasa nada
  }
}
