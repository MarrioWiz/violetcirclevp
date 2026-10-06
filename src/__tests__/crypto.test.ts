/// <reference types="node" />
import { createHash } from 'crypto';

import { isTooEasy, isValidPinFormat } from '@/features/auth/pinRules';
import { bytesToBase64, bytesToHex, safeEqual, utf8Decode, utf8Encode } from '@/lib/bytes';

// SHA-256 real de Node en lugar del módulo nativo de expo-crypto.
jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digest: jest.fn(async (_alg: string, data: Uint8Array) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const buf = require('crypto').createHash('sha256').update(Buffer.from(data)).digest();
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }),
  getRandomBytes: (n: number) => new Uint8Array(n).fill(7),
}));

const mockMemory: Record<string, string> = {};
jest.mock('@/services/secureStore', () => ({
  SECURE_KEYS: { masterKey: 'm', pinHash: 'h', pinSalt: 's', pinLength: 'l' },
  secureStore: {
    get: async (k: string) => mockMemory[k] ?? null,
    set: async (k: string, v: string) => {
      mockMemory[k] = v;
    },
    remove: async (k: string) => {
      delete mockMemory[k];
    },
  },
}));

// eslint-disable-next-line import/first
import { hashPin, savePin, sha256Hex, sha256OfText, verifyPin } from '@/services/crypto';

describe('utilidades binarias', () => {
  it('UTF-8 ida y vuelta con acentos, ñ y emoji', () => {
    const text = 'Contraseña: niña 💜 — “sí”';
    expect(utf8Decode(utf8Encode(text))).toBe(text);
    expect(Buffer.from(utf8Encode(text)).toString('utf8')).toBe(text);
  });

  it('hex y base64 coinciden con Node', () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 255, 16, 77]);
    expect(bytesToHex(bytes)).toBe(Buffer.from(bytes).toString('hex'));
    for (let n = 0; n < 6; n++) {
      const b = bytes.slice(0, n);
      expect(bytesToBase64(b)).toBe(Buffer.from(b).toString('base64'));
    }
  });

  it('comparación segura', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'ab')).toBe(false);
  });
});

describe('hash SHA-256 de evidencia', () => {
  it('vector conocido "abc"', async () => {
    expect(await sha256OfText('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('el hash de un archivo coincide con el que calcularía cualquier herramienta', async () => {
    const file = new Uint8Array(4096).map((_, i) => (i * 31) % 256);
    const expected = createHash('sha256').update(Buffer.from(file)).digest('hex');
    expect(await sha256Hex(file)).toBe(expected);
  });

  it('un solo byte distinto cambia el hash', async () => {
    const a = new Uint8Array([1, 2, 3, 4]);
    const b = new Uint8Array([1, 2, 3, 5]);
    expect(await sha256Hex(a)).not.toBe(await sha256Hex(b));
  });
});

describe('PIN', () => {
  it('formato y PIN demasiado fáciles', () => {
    expect(isValidPinFormat('1234')).toBe(true);
    expect(isValidPinFormat('123')).toBe(false);
    expect(isValidPinFormat('1234567')).toBe(false);
    expect(isValidPinFormat('12a4')).toBe(false);
    expect(isTooEasy('0000')).toBe(true);
    expect(isTooEasy('1234')).toBe(true);
    expect(isTooEasy('654321')).toBe(true);
    expect(isTooEasy('2580')).toBe(false);
  });

  it('se guarda como hash con sal, nunca en texto plano, y se verifica', async () => {
    await savePin('2580');
    expect(Object.values(mockMemory)).not.toContain('2580');
    expect(mockMemory.h).toBe(await hashPin('2580', mockMemory.s));
    expect(await verifyPin('2580')).toBe(true);
    expect(await verifyPin('2581')).toBe(false);
  });
});
