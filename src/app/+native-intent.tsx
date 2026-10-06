import { isSosPath } from '@/features/sos/message';
import { useSession } from '@/store/sessionStore';
import { useSettings } from '@/store/settingsStore';

/**
 * violetcirclevp://sos (botón lateral, botones de volumen, atajo del ícono) no navega a una
 * pantalla: activa "Pedir ayuda" encima de todo, sin pedir PIN.
 */
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }): string {
  try {
    if (isSosPath(path)) {
      if (initial) {
        // En arranque en frío los ajustes aún no cargan: se activa y el layout la muestra tras el onboarding.
        useSession.getState().setSosActive(true);
      } else if (useSettings.getState().onboarded) {
        useSession.getState().setSosActive(true);
      }
      return '/';
    }
    return path;
  } catch {
    return '/';
  }
}
