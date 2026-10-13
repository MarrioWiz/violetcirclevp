import { isSosPath, sosSecondsFromPath, sosTokenFromPath } from '@/features/sos/message';
import { sosNative } from '@/features/sos/sosService';
import { useSession } from '@/store/sessionStore';
import { useSettings } from '@/store/settingsStore';

/**
 * violetcirclevp://sos?k=… (botón lateral, botones de volumen, atajo del ícono) no navega a una
 * pantalla: activa "Pedir ayuda" encima de todo, sin pedir PIN. Sin la clave `k`, se ignora.
 */
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }): string {
  try {
    if (isSosPath(path)) {
      // Seguridad: solo los disparadores propios traen la clave. Un enlace que llegue por mensaje
      // o desde otra app abre la app normal, sin alerta ni SMS.
      if (!sosNative?.isValidSosToken(sosTokenFromPath(path))) return '/';
      // La mini app del botón lateral pide menos segundos para cancelar (?t=4).
      const seconds = sosSecondsFromPath(path);
      if (initial) {
        // En arranque en frío los ajustes aún no cargan: se activa y el layout la muestra tras el onboarding.
        useSession.getState().setSosActive(true, 'external', seconds);
      } else if (useSettings.getState().onboarded) {
        useSession.getState().setSosActive(true, 'external', seconds);
      }
      return '/';
    }
    return path;
  } catch {
    return '/';
  }
}
