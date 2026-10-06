import * as Linking from 'expo-linking';

import { confirmDialog, notify } from '@/lib/dialog';
import { S } from '@/lib/strings.es';
import { markExternalNavigation } from '@/store/sessionStore';

export const EMERGENCY_NUMBER = '911';

/** Abre el marcador con confirmación. Nunca llama sin que ella lo confirme. */
export async function call911(): Promise<void> {
  const ok = await confirmDialog({
    title: S.emergency.confirmTitle,
    message: S.emergency.confirmBody,
    confirmLabel: S.emergency.confirmCall,
  });
  if (ok) await callNumber(EMERGENCY_NUMBER);
}

export async function callNumber(phone: string): Promise<void> {
  const clean = phone.replace(/[^\d+]/g, '');
  try {
    markExternalNavigation();
    await Linking.openURL(`tel:${clean}`);
  } catch {
    notify(S.errors.generic);
  }
}
