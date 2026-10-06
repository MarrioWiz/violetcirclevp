import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';

import { notify } from '@/lib/dialog';
import { S } from '@/lib/strings.es';
import { markExternalNavigation } from '@/store/sessionStore';

import { whatsappUrl } from './message';

/**
 * Abre el compositor de Mensajes con destinatarias y texto listos.
 * iOS no permite enviar SMS automáticamente: ella toca "Enviar".
 */
export async function openSmsComposer(phones: string[], text: string): Promise<boolean> {
  try {
    if (!(await SMS.isAvailableAsync())) {
      notify(S.alert.smsUnavailable);
      return false;
    }
    markExternalNavigation();
    await SMS.sendSMSAsync(phones, text);
    return true;
  } catch {
    notify(S.errors.generic);
    return false;
  }
}

export async function openWhatsApp(text: string, phone?: string): Promise<boolean> {
  try {
    markExternalNavigation();
    await Linking.openURL(whatsappUrl(text, phone));
    return true;
  } catch {
    notify(S.errors.generic);
    return false;
  }
}

export async function copyText(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}

/** Ubicación aproximada, solo bajo demanda. No se guarda. */
export async function getApproxLocation(): Promise<{ lat: number; lng: number } | 'denied' | null> {
  try {
    markExternalNavigation(); // el diálogo de permiso pausa la app en Android
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) return 'denied';
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return null;
  }
}
