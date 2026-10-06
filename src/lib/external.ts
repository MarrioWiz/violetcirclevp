import * as Linking from 'expo-linking';

import { markExternalNavigation } from '@/store/sessionStore';

/** Abre un enlace en otra app sin que el autobloqueo cuente la salida como abandono. */
export function openExternalUrl(url: string): void {
  markExternalNavigation();
  Linking.openURL(url).catch(() => undefined);
}
