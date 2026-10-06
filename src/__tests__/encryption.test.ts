/// <reference types="node" />
import { base64ToBytes, bytesToBase64, bytesToHex, hexToBytes } from '@/lib/bytes';

// Simulación de expo-crypto que se comporta como en Android:
// fromCombined SOLO acepta bytes (con texto lanza, como el módulo nativo real).
const mockState = { generated: 0 };
jest.mock('expo-crypto', () => {
  const key = (bytes: Uint8Array) => ({ bytes: async () => bytes });
  return {
    CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
    AESEncryptionKey: {
      generate: jest.fn(async () => {
        mockState.generated++;
        return key(new Uint8Array(32).fill(mockState.generated));
      }),
      import: jest.fn(async (bytes: unknown) => {
        if (!(bytes instanceof Uint8Array)) throw new Error('Value is a string, expected an Object');
        return key(bytes);
      }),
    },
    // "Cifrado" de juguete: XOR con el primer byte de la llave (suficiente para probar el flujo).
    aesEncryptAsync: jest.fn(async (plain: Uint8Array, k: { bytes: () => Promise<Uint8Array> }) => {
      const kb = (await k.bytes())[0];
      const out = plain.map((b) => b ^ kb);
      return { combined: async (enc: string) => (enc === 'bytes' ? out : 'BASE64-NO-SOPORTADO') };
    }),
    AESSealedData: {
      fromCombined: (data: unknown) => {
        if (!(data instanceof Uint8Array)) throw new Error('Value is a string, expected an Object');
        return { data };
      },
    },
    aesDecryptAsync: jest.fn(async (sealed: { data: Uint8Array }, k: { bytes: () => Promise<Uint8Array> }) => {
      const kb = (await k.bytes())[0];
      return sealed.data.map((b) => b ^ kb);
    }),
    getRandomBytes: (n: number) => new Uint8Array(n),
    digest: jest.fn(),
  };
});

const mockSecure: Record<string, string> = {};
jest.mock('@/services/secureStore', () => ({
  SECURE_KEYS: { masterKey: 'm', pinHash: 'h', pinSalt: 's', pinLength: 'l' },
  secureStore: {
    get: async (k: string) => mockSecure[k] ?? null,
    set: async (k: string, v: string) => {
      mockSecure[k] = v;
    },
    remove: async (k: string) => {
      delete mockSecure[k];
    },
  },
}));

// eslint-disable-next-line import/first
import { decryptJson, encryptJson, forgetMasterKey } from '@/services/crypto';

describe('base64 y hex', () => {
  it('base64ToBytes es el inverso de bytesToBase64 (todas las longitudes)', () => {
    for (let n = 0; n < 40; n++) {
      const bytes = new Uint8Array(n).map((_, i) => (i * 97 + n) % 256);
      const b64 = bytesToBase64(bytes);
      expect(b64).toBe(Buffer.from(bytes).toString('base64'));
      expect(Array.from(base64ToBytes(b64))).toEqual(Array.from(bytes));
    }
  });

  it('hexToBytes es el inverso de bytesToHex', () => {
    const bytes = new Uint8Array([0, 15, 16, 255, 128]);
    expect(Array.from(hexToBytes(bytesToHex(bytes)))).toEqual(Array.from(bytes));
  });
});

describe('cifrado local', () => {
  beforeEach(() => {
    forgetMasterKey();
    mockState.generated = 0;
    Object.keys(mockSecure).forEach((k) => delete mockSecure[k]);
  });

  it('ida y vuelta, pasando bytes (no texto) al módulo nativo', async () => {
    const data = { nombre: 'Ana', notas: 'niña 💜' };
    const payload = await encryptJson(data);
    expect(typeof payload).toBe('string');
    expect(await decryptJson(payload)).toEqual(data);
  });

  it('con lecturas en paralelo en el primer uso se genera UNA sola llave', async () => {
    const payloads = await Promise.all([encryptJson({ a: 1 }), encryptJson({ b: 2 }), encryptJson({ c: 3 })]);
    expect(mockState.generated).toBe(1);
    // Simula reiniciar la app: se olvida la llave en memoria y se vuelve a leer de SecureStore.
    forgetMasterKey();
    expect(await Promise.all(payloads.map((p) => decryptJson(p)))).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
    expect(mockState.generated).toBe(1);
  });
});
