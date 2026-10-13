import * as Linking from 'expo-linking';

import { markExternalNavigation } from '@/store/sessionStore';

/** Solo estos tipos de enlace se abren (nada de esquemas raros que lancen otras apps). */
const ALLOWED = /^(https?:\/\/|mailto:|tel:)/i;

export function isSafeUrl(url: string): boolean {
  return ALLOWED.test(url.trim());
}

/** Abre un enlace en otra app sin que el autobloqueo cuente la salida como abandono. */
export function openExternalUrl(url: string): void {
  if (!isSafeUrl(url)) return;
  markExternalNavigation();
  Linking.openURL(url.trim()).catch(() => undefined);
}
