import AsyncStorage from '@react-native-async-storage/async-storage';

/** Prefijo común para poder borrar todo lo de la app con "Borrar todos mis datos". */
export const STORAGE_PREFIX = 'vcvp.';

export const storage = {
  async get(key: string): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_PREFIX + key);
  },
  async set(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_PREFIX + key, value);
  },
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_PREFIX + key);
  },
  async getJson<T>(key: string, fallback: T): Promise<T> {
    const raw = await storage.get(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  async setJson(key: string, value: unknown): Promise<void> {
    await storage.set(key, JSON.stringify(value));
  },
  /** Borra todas las claves de la app (incluida la sesión anónima de Firebase). */
  async clearAll(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((k) => k.startsWith(STORAGE_PREFIX) || k.startsWith('firebase:'));
    if (ours.length) await AsyncStorage.multiRemove(ours);
  },
};
