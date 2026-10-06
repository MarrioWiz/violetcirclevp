const mockStore: Record<string, string> = {};
jest.mock('@/services/storage', () => ({
  storage: {
    get: async (k: string) => mockStore[k] ?? null,
    set: async (k: string, v: string) => {
      mockStore[k] = v;
    },
    remove: async (k: string) => {
      delete mockStore[k];
    },
  },
}));
jest.mock('@/services/crypto', () => ({
  encryptJson: async (v: unknown) => `ok:${JSON.stringify(v)}`,
  decryptJson: async (raw: string) => {
    if (!raw.startsWith('ok:')) throw new Error('no se puede descifrar');
    return JSON.parse(raw.slice(3));
  },
}));

// eslint-disable-next-line import/first
import { UNREADABLE_PREFIX, encryptedStorage } from '@/services/encryptedStorage';

describe('almacenamiento cifrado', () => {
  beforeEach(() => Object.keys(mockStore).forEach((k) => delete mockStore[k]));

  it('lee lo que escribe', async () => {
    await encryptedStorage.write('circle', [{ name: 'Ana' }]);
    expect(await encryptedStorage.read('circle', [])).toEqual([{ name: 'Ana' }]);
  });

  it('si no puede descifrar, respalda el dato original y una escritura nueva no lo destruye', async () => {
    mockStore['enc.incidents'] = 'DATO-CIFRADO-ANTIGUO';
    expect(await encryptedStorage.read('incidents', [])).toEqual([]);
    await encryptedStorage.write('incidents', [{ title: 'nueva' }]);
    const backups = Object.entries(mockStore).filter(([k]) => k.startsWith(`${UNREADABLE_PREFIX}incidents.`));
    expect(backups).toHaveLength(1);
    expect(backups[0][1]).toBe('DATO-CIFRADO-ANTIGUO');
  });
});
