import { useEffect } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';

import { useSession } from '@/store/sessionStore';
import { useSettings } from '@/store/settingsStore';
import type { AutoLock } from '@/types';

const AUTOLOCK_MS: Record<AutoLock, number> = { immediate: 0, '1m': 60_000, '5m': 300_000 };

/**
 * - Tapa el contenido en cuanto la app deja de estar activa (app switcher).
 * - Bloquea según el tiempo configurado al volver de segundo plano.
 */
export function useAppLifecycle(): void {
  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      const session = useSession.getState();
      const settings = useSettings.getState();
      if (!settings.onboarded) return;

      // ¿La propia app abrió otra (cámara, Mensajes, compartir) hace poco? Entonces no es un abandono.
      const external = Date.now() < session.externalUntil;

      if (state === 'active') {
        const since = session.backgroundedAt;
        if (since !== null && !external && Date.now() - since >= AUTOLOCK_MS[settings.autolock]) session.lock();
        session.setBackgroundedAt(null);
        useSession.setState({ externalUntil: 0 });
        session.setCovered(false);
        return;
      }

      // 'inactive' (iOS: app switcher, centro de control) o 'background'.
      if (settings.hidePreview) session.setCovered(true);
      if (state === 'background' && session.backgroundedAt === null) {
        session.setBackgroundedAt(Date.now());
        if (settings.autolock === 'immediate' && !external) session.lock();
      }
    };
    const sub = AppState.addEventListener('change', onChange);

    // Android: si la app vuelve al frente sin que llegue un 'change' a 'active' (p. ej. al tocar el
    // ícono con la app ya abierta), el evento 'focus' evita que la capa de privacidad se quede puesta.
    const onFocus = () => {
      if (AppState.currentState !== 'active') return;
      if (useSession.getState().backgroundedAt !== null) onChange('active');
      else useSession.getState().setCovered(false);
    };
    const focusSub = Platform.OS === 'android' ? AppState.addEventListener('focus', onFocus) : null;

    return () => {
      sub.remove();
      focusSub?.remove();
    };
  }, []);
}
