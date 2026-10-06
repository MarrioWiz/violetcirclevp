import { create } from 'zustand';

import { bundled, fetchRemote, readCache } from '@/features/content/repository';
import { isFirebaseConfigured } from '@/services/firebase';
import type { Article, DirectoryEntry, Guide } from '@/types';

/** Une contenido remoto con el empaquetado: lo remoto reemplaza por slug/id. */
function mergeBy<T>(base: T[], remote: T[] | undefined, key: keyof T): T[] {
  if (!remote?.length) return base;
  const map = new Map(base.map((x) => [x[key], x]));
  remote.forEach((x) => map.set(x[key], x));
  return Array.from(map.values());
}

interface ContentState {
  guides: Guide[];
  articles: Article[];
  directory: DirectoryEntry[];
  fetchedAt: string | null;
  refreshing: boolean;
  offline: boolean;
  init: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useContent = create<ContentState>((set, get) => ({
  guides: bundled.guides,
  articles: bundled.articles,
  directory: bundled.directory,
  fetchedAt: null,
  refreshing: false,
  offline: false,
  init: async () => {
    const cache = await readCache();
    set({
      guides: mergeBy(bundled.guides, cache.guides, 'slug'),
      articles: mergeBy(bundled.articles, cache.articles, 'slug'),
      directory: mergeBy(bundled.directory, cache.directory, 'id'),
      fetchedAt: cache.fetchedAt ?? null,
    });
    void get().refresh();
  },
  refresh: async () => {
    if (get().refreshing) return;
    set({ refreshing: true });
    const remote = await fetchRemote();
    if (remote) {
      set({
        guides: mergeBy(bundled.guides, remote.guides, 'slug'),
        articles: mergeBy(bundled.articles, remote.articles, 'slug'),
        directory: mergeBy(bundled.directory, remote.directory, 'id'),
        fetchedAt: remote.fetchedAt ?? null,
        offline: false,
      });
    } else {
      set({ offline: isFirebaseConfigured });
    }
    set({ refreshing: false });
  },
}));
