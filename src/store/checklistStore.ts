import { create } from 'zustand';

import { encryptedStorage } from '@/services/encryptedStorage';

const KEY = 'checklists';

/** Avance de checklists y favoritos: solo local y cifrado. */
interface ChecklistState {
  /** `${guideSlug}:${itemId}` → hecho */
  done: Record<string, boolean>;
  favorites: string[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  toggle: (guideSlug: string, itemId: string) => Promise<void>;
  toggleFavorite: (slug: string) => Promise<void>;
  resetGuide: (guideSlug: string) => Promise<void>;
  reset: () => void;
}

interface Persisted {
  done: Record<string, boolean>;
  favorites: string[];
}

export const checklistKey = (guideSlug: string, itemId: string) => `${guideSlug}:${itemId}`;

export const useChecklist = create<ChecklistState>((set, get) => {
  const persist = async (patch: Partial<Persisted>) => {
    set(patch);
    const { done, favorites } = get();
    await encryptedStorage.write(KEY, { done, favorites });
  };
  return {
    done: {},
    favorites: [],
    hydrated: false,
    hydrate: async () => {
      const saved = await encryptedStorage.read<Persisted>(KEY, { done: {}, favorites: [] });
      set({ ...saved, hydrated: true });
    },
    toggle: async (guideSlug, itemId) => {
      const k = checklistKey(guideSlug, itemId);
      const done = { ...get().done };
      if (done[k]) delete done[k];
      else done[k] = true;
      await persist({ done });
    },
    toggleFavorite: async (slug) => {
      const favs = get().favorites;
      await persist({ favorites: favs.includes(slug) ? favs.filter((s) => s !== slug) : [...favs, slug] });
    },
    resetGuide: async (guideSlug) => {
      const done = Object.fromEntries(
        Object.entries(get().done).filter(([k]) => !k.startsWith(guideSlug + ':')),
      );
      await persist({ done });
    },
    reset: () => set({ done: {}, favorites: [], hydrated: true }),
  };
});
