import * as Crypto from 'expo-crypto';

import { base64ToBytes, bytesToBase64, bytesToHex, hexToBytes, safeEqual, utf8Decode, utf8Encode } from '@/lib/bytes';

import { SECURE_KEYS, secureStore } from './secureStore';

// ── Hashes ────────────────────────────────────────────────────────────────

export async function sha256Hex(data: Uint8Array): Promise<string> {
  const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, new Uint8Array(data));
  return bytesToHex(digest);
}

export async function sha256OfText(text: string): Promise<string> {
  return sha256Hex(utf8Encode(text));
}

// ── PIN ───────────────────────────────────────────────────────────────────

export async function hashPin(pin: string, saltHex: string): Promise<string> {
  return sha256OfText(`${saltHex}:${pin}`);
}

export async function savePin(pin: string): Promise<void> {
  const salt = bytesToHex(Crypto.getRandomBytes(16));
  const hash = await hashPin(pin, salt);
  await secureStore.set(SECURE_KEYS.pinSalt, salt);
  await secureStore.set(SECURE_KEYS.pinHash, hash);
  await secureStore.set(SECURE_KEYS.pinLength, String(pin.length));
}

export async function verifyPin(pin: string): Promise<boolean> {
  const [salt, stored] = await Promise.all([
    secureStore.get(SECURE_KEYS.pinSalt),
    secureStore.get(SECURE_KEYS.pinHash),
  ]);
  if (!salt || !stored) return false;
  return safeEqual(await hashPin(pin, salt), stored);
}

export async function hasPin(): Promise<boolean> {
  return (await secureStore.get(SECURE_KEYS.pinHash)) !== null;
}

export async function getPinLength(): Promise<number> {
  const raw = await secureStore.get(SECURE_KEYS.pinLength);
  const n = raw ? Number(raw) : 4;
  return n >= 4 && n <= 6 ? n : 4;
}

// ── Cifrado AES-256-GCM ──────────────────────────────────────────────────

let keyPromise: Promise<Crypto.AESEncryptionKey> | null = null;

async function loadOrCreateMasterKey(): Promise<Crypto.AESEncryptionKey> {
  const stored = await secureStore.get(SECURE_KEYS.masterKey);
  if (stored) return Crypto.AESEncryptionKey.import(hexToBytes(stored));
  const key = await Crypto.AESEncryptionKey.generate();
  await secureStore.set(SECURE_KEYS.masterKey, bytesToHex(await key.bytes()));
  return key;
}

/**
 * Se guarda la PROMESA, no la llave: si varias lecturas arrancan a la vez en el primer uso,
 * todas esperan la misma llave en lugar de generar una distinta cada una.
 */
function getMasterKey(): Promise<Crypto.AESEncryptionKey> {
  if (!keyPromise) {
    keyPromise = loadOrCreateMasterKey().catch((e: unknown) => {
      keyPromise = null;
      throw e;
    });
  }
  return keyPromise;
}

/** Olvida la llave en memoria (se usa al borrar todos los datos). */
export function forgetMasterKey(): void {
  keyPromise = null;
}

export async function encryptBytes(plain: Uint8Array): Promise<string> {
  const key = await getMasterKey();
  const sealed = await Crypto.aesEncryptAsync(plain, key);
  return bytesToBase64((await sealed.combined('bytes')) as Uint8Array);
}

export async function decryptBytes(combinedBase64: string): Promise<Uint8Array> {
  const key = await getMasterKey();
  // En Android, fromCombined solo acepta bytes (no texto base64), aunque la documentación diga lo contrario.
  const sealed = Crypto.AESSealedData.fromCombined(base64ToBytes(combinedBase64));
  return (await Crypto.aesDecryptAsync(sealed, key, { output: 'bytes' })) as Uint8Array;
}

export async function encryptJson(value: unknown): Promise<string> {
  return encryptBytes(utf8Encode(JSON.stringify(value)));
}

export async function decryptJson<T>(payload: string): Promise<T> {
  return JSON.parse(utf8Decode(await decryptBytes(payload))) as T;
}
