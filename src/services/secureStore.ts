import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { storage } from './storage';

// En iPhone/Android: Keychain / Keystore. En web no existe SecureStore, así que
// se usa el almacenamiento del navegador (protección menor; documentado en PRIVACIDAD.md).
const isWeb = Platform.OS === 'web';

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const SECURE_KEYS = {
  masterKey: 'vcvp_master_key',
  pinHash: 'vcvp_pin_hash',
  pinSalt: 'vcvp_pin_salt',
  pinLength: 'vcvp_pin_length',
} as const;

export const secureStore = {
  async get(key: string): Promise<string | null> {
    if (isWeb) return storage.get('secure.' + key);
    return SecureStore.getItemAsync(key, OPTIONS);
  },
  async set(key: string, value: string): Promise<void> {
    if (isWeb) return storage.set('secure.' + key, value);
    await SecureStore.setItemAsync(key, value, OPTIONS);
  },
  async remove(key: string): Promise<void> {
    if (isWeb) return storage.remove('secure.' + key);
    await SecureStore.deleteItemAsync(key, OPTIONS);
  },
  async clearAll(): Promise<void> {
    await Promise.all(Object.values(SECURE_KEYS).map((k) => secureStore.remove(k)));
  },
};
