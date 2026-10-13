import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Linking, PermissionsAndroid, Platform } from 'react-native';

import { storage } from '@/services/storage';
import { markExternalNavigation } from '@/store/sessionStore';

/**
 * Permisos que la app pide al inicio, con el mismo vocabulario en Android y web:
 * - granted: concedido.
 * - undetermined: aún no se ha preguntado (o el navegador lo volverá a preguntar).
 * - denied: se negó, pero se puede volver a pedir.
 * - blocked: se negó para siempre; solo se puede cambiar en Ajustes del teléfono / navegador.
 */
export type PermKey = 'location' | 'sms' | 'notifications';
export type PermState = 'granted' | 'undetermined' | 'denied' | 'blocked';

const SMS_BLOCKED_KEY = 'perm-sms-blocked';

/** Qué permisos aplican en esta plataforma (el SMS automático solo existe en el APK de Android). */
export function permissionsForPlatform(): PermKey[] {
  if (Platform.OS === 'android') return ['location', 'sms', 'notifications'];
  if (Platform.OS === 'ios') return ['location', 'notifications'];
  // Web (iPhone/PC): sin push ni SMS; ver docs/IPHONE.md.
  return ['location'];
}

/** Críticos: sin ellos "Pedir ayuda" no puede mandar dónde está ni enviar solo el SMS. */
export function criticalForPlatform(): PermKey[] {
  return Platform.OS === 'android' ? ['location', 'sms'] : ['location'];
}

// ── Ubicación ─────────────────────────────────────────────────────────────

function fromLocation(p: Location.LocationPermissionResponse): PermState {
  if (p.granted) {
    // En Android 12+ se puede conceder solo "aproximada": para la alerta necesitamos la precisa.
    if (Platform.OS === 'android' && p.android?.accuracy !== 'fine') return p.canAskAgain ? 'denied' : 'blocked';
    return 'granted';
  }
  if (Platform.OS === 'web') return p.status === 'denied' ? 'blocked' : 'undetermined';
  if (p.status === 'undetermined') return 'undetermined';
  return p.canAskAgain ? 'denied' : 'blocked';
}

async function checkLocation(): Promise<PermState> {
  try {
    return fromLocation(await Location.getForegroundPermissionsAsync());
  } catch {
    // Safari viejo sin navigator.permissions: no se puede consultar sin preguntar.
    return 'undetermined';
  }
}

async function requestLocation(): Promise<PermState> {
  if (Platform.OS === 'web') {
    try {
      return fromLocation(await Location.requestForegroundPermissionsAsync());
    } catch {
      // Sin navigator.permissions: pedimos la posición directamente para que salga el aviso.
      return new Promise((resolve) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve('blocked');
        navigator.geolocation.getCurrentPosition(
          () => resolve('granted'),
          (e) => resolve(e.code === e.PERMISSION_DENIED ? 'blocked' : 'granted'),
          { timeout: 15_000 },
        );
      });
    }
  }
  markExternalNavigation();
  return fromLocation(await Location.requestForegroundPermissionsAsync());
}

// ── SMS (solo Android) ────────────────────────────────────────────────────

async function checkSms(): Promise<PermState> {
  if (Platform.OS !== 'android') return 'blocked';
  if (await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.SEND_SMS)) return 'granted';
  // Android no dice si es "para siempre" hasta que se pide; recordamos la última respuesta.
  return (await storage.get(SMS_BLOCKED_KEY)) === '1' ? 'blocked' : 'undetermined';
}

async function requestSms(): Promise<PermState> {
  if (Platform.OS !== 'android') return 'blocked';
  markExternalNavigation();
  const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.SEND_SMS);
  if (res === PermissionsAndroid.RESULTS.GRANTED) {
    await storage.remove(SMS_BLOCKED_KEY);
    return 'granted';
  }
  if (res === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    await storage.set(SMS_BLOCKED_KEY, '1');
    return 'blocked';
  }
  return 'denied';
}

// ── Notificaciones ────────────────────────────────────────────────────────

function fromNotifications(p: Notifications.NotificationPermissionsStatus): PermState {
  if (p.granted) return 'granted';
  if (p.status === 'undetermined') return 'undetermined';
  return p.canAskAgain ? 'denied' : 'blocked';
}

async function checkNotifications(): Promise<PermState> {
  if (Platform.OS === 'web') return 'blocked';
  return fromNotifications(await Notifications.getPermissionsAsync());
}

async function requestNotifications(): Promise<PermState> {
  if (Platform.OS === 'web') return 'blocked';
  if (Platform.OS === 'android') {
    // Android 13+ solo muestra el aviso si ya existe un canal.
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Recordatorios',
      importance: Notifications.AndroidImportance.DEFAULT,
    }).catch(() => undefined);
  }
  markExternalNavigation();
  return fromNotifications(
    await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: false, allowBadge: false } }),
  );
}

// ── API pública ───────────────────────────────────────────────────────────

export async function checkPermission(key: PermKey): Promise<PermState> {
  try {
    if (key === 'location') return await checkLocation();
    if (key === 'sms') return await checkSms();
    return await checkNotifications();
  } catch {
    return 'undetermined';
  }
}

export async function requestPermission(key: PermKey): Promise<PermState> {
  try {
    if (key === 'location') return await requestLocation();
    if (key === 'sms') return await requestSms();
    return await requestNotifications();
  } catch {
    return checkPermission(key);
  }
}

export async function checkAll(keys: PermKey[] = permissionsForPlatform()): Promise<Record<PermKey, PermState>> {
  const out = {} as Record<PermKey, PermState>;
  for (const k of keys) out[k] = await checkPermission(k);
  return out;
}

/** ¿Falta algún permiso crítico? (para mostrar de nuevo la pantalla de permisos). */
export async function missingCritical(): Promise<PermKey[]> {
  const missing: PermKey[] = [];
  for (const k of criticalForPlatform()) if ((await checkPermission(k)) !== 'granted') missing.push(k);
  return missing;
}

/** Abre los ajustes de la app en el teléfono. En web no existe: se muestran instrucciones. */
export async function openAppSettings(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  markExternalNavigation();
  try {
    await Linking.openSettings();
    return true;
  } catch {
    return false;
  }
}

// ── Web en iPhone ─────────────────────────────────────────────────────────

export function isIosWeb(): boolean {
  return Platform.OS === 'web' && typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** La web está abierta como app instalada (pantalla de inicio), no en una pestaña de Safari. */
export function isStandaloneWeb(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches === true;
}
