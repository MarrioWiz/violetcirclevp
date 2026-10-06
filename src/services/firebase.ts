import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, signInAnonymously, type Auth } from 'firebase/auth';
// "firebase/auth" no expone la persistencia de React Native en su mapa de exports;
// se importa del paquete interno, que sí trae el build react-native.
// @ts-expect-error -- el tipo solo existe en el build react-native de @firebase/auth
import { getReactNativePersistence } from '@firebase/auth';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

/** La app funciona sin Firebase (contenido empaquetado). */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  if (!app) app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const a = getFirebaseApp();
  if (!a) return null;
  if (auth) return auth;
  if (Platform.OS === 'web') {
    auth = getAuth(a);
  } else {
    try {
      auth = initializeAuth(a, { persistence: getReactNativePersistence(AsyncStorage) });
    } catch {
      auth = getAuth(a); // ya inicializado (Fast Refresh)
    }
  }
  return auth;
}

export function getDb(): Firestore | null {
  const a = getFirebaseApp();
  if (!a) return null;
  if (db) return db;
  if (Platform.OS === 'web') {
    db = getFirestore(a);
  } else {
    try {
      // El streaming por defecto de Firestore falla con Hermes; long-polling sí funciona.
      db = initializeFirestore(a, { experimentalAutoDetectLongPolling: true });
    } catch {
      db = getFirestore(a);
    }
  }
  return db;
}

/** Sesión anónima: no pide nombre, correo ni ningún dato personal. */
export async function ensureAnonymousSession(): Promise<string | null> {
  const a = getFirebaseAuth();
  if (!a) return null;
  if (a.currentUser) return a.currentUser.uid;
  try {
    const cred = await signInAnonymously(a);
    return cred.user.uid;
  } catch {
    return null; // sin internet o proveedor anónimo deshabilitado: la app sigue funcionando
  }
}

/** Borra la cuenta anónima (parte de "Borrar todos mis datos"). */
export async function deleteFirebaseAccount(): Promise<void> {
  const a = getFirebaseAuth();
  const user = a?.currentUser;
  if (!user) return;
  try {
    await user.delete();
  } catch {
    await a?.signOut().catch(() => undefined);
  }
}
