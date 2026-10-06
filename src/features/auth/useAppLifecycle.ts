import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

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

      if (state === 'active') {
        const since = session.backgroundedAt;
        if (since !== null && Date.now() - since >= AUTOLOCK_MS[settings.autolock]) session.lock();
        session.setBackgroundedAt(null);
        session.setCovered(false);
        return;
      }

      // 'inactive' (iOS: app switcher, centro de control) o 'background'.
      if (settings.hidePreview) session.setCovered(true);
      if (state === 'background' && session.backgroundedAt === null) {
        session.setBackgroundedAt(Date.now());
        if (settings.autolock === 'immediate') session.lock();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);
}
