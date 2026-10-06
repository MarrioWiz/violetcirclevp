import { decryptJson, encryptJson } from './crypto';
import { storage } from './storage';

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
      // Llave distinta o dato dañado: no se registra nada con contenido.
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
