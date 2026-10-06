import * as Location from 'expo-location';
import { PermissionsAndroid, Platform } from 'react-native';

import VcvpSos from '../../../modules/vcvp-sos/src/VcvpSosModule';

import { normalizePhone } from '@/features/circle/message';
import { markExternalNavigation } from '@/store/sessionStore';

import type { SosLocation } from './message';

/** El módulo nativo solo existe en la build de Android. */
export const sosNative = Platform.OS === 'android' ? VcvpSos : null;
export const sosSupported = !!sosNative;

// ── Permisos ──────────────────────────────────────────────────────────────

export async function hasSmsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.SEND_SMS);
}

export async function requestSmsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  markExternalNavigation();
  const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.SEND_SMS, {
    title: 'Enviar SMS de ayuda',
    message:
      'Para que "Pedir ayuda" mande un SMS con tu ubicación a tu círculo cuando tú lo confirmes. Nunca se envía nada sin tu confirmación.',
    buttonPositive: 'Permitir',
    buttonNegative: 'Ahora no',
  });
  return res === PermissionsAndroid.RESULTS.GRANTED;
}

export async function hasPreciseLocation(): Promise<boolean> {
  const perm = await Location.getForegroundPermissionsAsync();
  return perm.granted && (Platform.OS !== 'android' || perm.android?.accuracy === 'fine');
}

export async function requestPreciseLocation(): Promise<boolean> {
  markExternalNavigation();
  await Location.requestForegroundPermissionsAsync();
  return hasPreciseLocation();
}

// ── Ubicación ─────────────────────────────────────────────────────────────

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([p, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))]);
}

function withLastKnown(pos: Location.LocationObject | null): SosLocation | null {
  if (!pos) return null;
  return { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
}

/** Ubicación precisa con límite de tiempo; si tarda, usa la última conocida. */
export async function getSosLocation(timeoutMs = 10_000): Promise<SosLocation | null> {
  try {
    const perm = await Location.getForegroundPermissionsAsync();
    if (!perm.granted) return null;
    // Con la ubicación del teléfono apagada NO se pide activarla: en una emergencia ese diálogo
    // detendría el envío. Se manda sin ubicación (el mensaje pide que la llamen).
    if (!(await Location.hasServicesEnabledAsync())) {
      return withLastKnown(await Location.getLastKnownPositionAsync().catch(() => null));
    }
    const fresh = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High, mayShowUserSettingsDialog: false }).catch(
        () => null,
      ),
      timeoutMs,
    );
    return withLastKnown(fresh ?? (await Location.getLastKnownPositionAsync().catch(() => null)));
  } catch {
    return null;
  }
}

// ── Envío ─────────────────────────────────────────────────────────────────

export async function sendSosSms(phones: string[], text: string): Promise<number> {
  if (!sosNative) throw new Error('not-supported');
  return sosNative.sendSms(phones.map(normalizePhone), text);
}

export async function setShowWhenLocked(on: boolean): Promise<void> {
  try {
    await sosNative?.setShowWhenLocked(on);
  } catch {
    // ignorar
  }
}
