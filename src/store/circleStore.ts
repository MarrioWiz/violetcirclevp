import * as Crypto from 'expo-crypto';
import { create } from 'zustand';

import { encryptedStorage } from '@/services/encryptedStorage';
import type { CircleContact } from '@/types';

export const MAX_CONTACTS = 5;
const KEY = 'circle';

interface CircleState {
  contacts: CircleContact[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  add: (c: Omit<CircleContact, 'id' | 'createdAt'>) => Promise<void>;
  update: (id: string, patch: Partial<Omit<CircleContact, 'id' | 'createdAt'>>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reset: () => void;
}

export const useCircle = create<CircleState>((set, get) => {
  const persist = async (contacts: CircleContact[]) => {
    set({ contacts });
    await encryptedStorage.write(KEY, contacts);
  };
  return {
    contacts: [],
    hydrated: false,
    hydrate: async () => {
      const contacts = await encryptedStorage.read<CircleContact[]>(KEY, []);
      set({ contacts, hydrated: true });
    },
    add: async (c) => {
      const current = get().contacts;
      if (current.length >= MAX_CONTACTS) throw new Error('circle-full');
      await persist([...current, { ...c, id: Crypto.randomUUID(), createdAt: new Date().toISOString() }]);
    },
    update: async (id, patch) => {
      await persist(get().contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    },
    remove: async (id) => {
      await persist(get().contacts.filter((c) => c.id !== id));
    },
    reset: () => set({ contacts: [], hydrated: true }),
  };
});
