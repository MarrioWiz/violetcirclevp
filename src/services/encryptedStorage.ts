import { decryptJson, encryptJson } from './crypto';
import { storage } from './storage';

/** Prefijo de los respaldos de datos que no se pudieron descifrar (siguen cifrados). */
export const UNREADABLE_PREFIX = 'enc-unreadable.';

/**
 * Guarda colecciones sensibles (círculo, bitácora, avances) cifradas con AES-GCM.
 * En AsyncStorage solo queda texto cifrado; la llave vive en SecureStore.
 */
export const encryptedStorage = {
  async read<T>(key: string, fallback: T): Promise<T> {
    const raw = await storage.get('enc.' + key);
    if (!raw) return fallback;
    try {
      return await decryptJson<T>(raw);
    } catch {
      // Si no se puede descifrar, NO se pierde: se respalda tal cual (cifrado) antes de que
      // la siguiente escritura reemplace la colección. Nunca se registra su contenido.
      await storage.set(`${UNREADABLE_PREFIX}${key}.${Date.now()}`, raw);
      await storage.remove('enc.' + key);
      return fallback;
    }
  },
  async write(key: string, value: unknown): Promise<void> {
    await storage.set('enc.' + key, await encryptJson(value));
  },
  async remove(key: string): Promise<void> {
    await storage.remove('enc.' + key);
  },
};
