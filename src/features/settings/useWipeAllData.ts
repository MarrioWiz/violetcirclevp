import { router } from 'expo-router';
import { useCallback } from 'react';

import { confirmDialog, notify } from '@/lib/dialog';
import { S } from '@/lib/strings.es';
import { forgetMasterKey } from '@/services/crypto';
import { isDiscreetIconOn, setDiscreetIcon } from '@/services/discreet';
import { deleteAllEvidence } from '@/services/evidenceFiles';
import { deleteFirebaseAccount } from '@/services/firebase';
import { cancelAllReminders } from '@/services/notifications';
import { secureStore } from '@/services/secureStore';
import { storage } from '@/services/storage';
import { useChecklist } from '@/store/checklistStore';
import { useCircle } from '@/store/circleStore';
import { useIncidents } from '@/store/incidentsStore';
import { useSession } from '@/store/sessionStore';
import { useSettings } from '@/store/settingsStore';

/** Borra todo lo local + la cuenta anónima. Siempre con doble confirmación. */
export async function wipeAllData(): Promise<void> {
  await deleteFirebaseAccount();
  await cancelAllReminders();
  deleteAllEvidence();
  await storage.clearAll();
  await secureStore.clearAll();
  forgetMasterKey();
  useCircle.getState().reset();
  useChecklist.getState().reset();
  useIncidents.getState().reset();
  useSettings.getState().reset();
  await useSession.getState().leaveDisguise();
  // Al final, porque en Android cambiar el ícono cierra la app.
  if (await isDiscreetIconOn()) await setDiscreetIcon(false);
}

export function useWipeAllData() {
  return useCallback(async ({ fromLock = false }: { fromLock?: boolean } = {}) => {
    const first = await confirmDialog({
      title: fromLock ? S.lock.forgot : S.settings.deleteConfirm1Title,
      message: fromLock ? S.lock.forgotBody : S.settings.deleteConfirm1Body,
      confirmLabel: fromLock ? S.lock.forgotAction : S.common.continue,
      destructive: true,
    });
    if (!first) return false;
    const second = await confirmDialog({
      title: S.settings.deleteConfirm2Title,
      message: S.settings.deleteConfirm1Body,
      confirmLabel: S.settings.deleteAll,
      destructive: true,
    });
    if (!second) return false;
    try {
      await wipeAllData();
      router.replace('/bienvenida');
      notify(S.settings.deleted);
      return true;
    } catch {
      notify(S.errors.generic);
      return false;
    }
  }, []);
}
