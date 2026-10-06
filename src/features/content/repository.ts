import { collection, getDocs, query, where } from 'firebase/firestore';

import articlesJson from '@/assets/content/articles.json';
import directoryJson from '@/assets/content/directory.json';
import guidesJson from '@/assets/content/guides.json';
import legalJson from '@/assets/content/legal.json';
import templatesJson from '@/assets/content/templates.json';
import triageJson from '@/assets/content/triage.json';
import { ensureAnonymousSession, getDb, isFirebaseConfigured } from '@/services/firebase';
import { storage } from '@/services/storage';
import type { Article, DirectoryEntry, Guide, MessageTemplate, TriageTree } from '@/types';

// Contenido empaquetado: la app siempre funciona sin internet.
export const bundled = {
  guides: guidesJson.guides as Guide[],
  articles: articlesJson.articles as Article[],
  audit: articlesJson.audit,
  directory: directoryJson.entries as DirectoryEntry[],
  templates: templatesJson.templates as MessageTemplate[],
  triage: triageJson as unknown as TriageTree,
  legal: legalJson,
};

export type LegalContent = typeof legalJson;

interface RemoteCache {
  guides?: Guide[];
  articles?: Article[];
  directory?: DirectoryEntry[];
  fetchedAt?: string;
}

const CACHE_KEY = 'content-cache';

export async function readCache(): Promise<RemoteCache> {
  return storage.getJson<RemoteCache>(CACHE_KEY, {});
}

/**
 * Descarga contenido institucional de Firestore (solo lectura) y lo guarda como
 * caché pública. Si no hay Firebase o internet, devuelve null y la app sigue con
 * lo empaquetado / la última caché.
 */
export async function fetchRemote(): Promise<RemoteCache | null> {
  if (!isFirebaseConfigured) return null;
  const db = getDb();
  if (!db) return null;
  const uid = await ensureAnonymousSession();
  if (!uid) return null;
  try {
    const [contentSnap, dirSnap] = await Promise.all([
      getDocs(collection(db, 'content')),
      // La regla exige verified == true; la consulta debe pedirlo explícitamente.
      getDocs(query(collection(db, 'directory'), where('verified', '==', true))),
    ]);
    const guides: Guide[] = [];
    const articles: Article[] = [];
    contentSnap.forEach((d) => {
      const data = d.data() as (Guide | Article) & { kind?: string };
      if (data.kind === 'article') articles.push({ ...(data as Article), slug: d.id });
      else guides.push({ ...(data as Guide), slug: d.id });
    });
    const directory = dirSnap.docs.map((d) => ({ ...(d.data() as DirectoryEntry), id: d.id }));
    const cache: RemoteCache = {
      guides: guides.length ? guides : undefined,
      articles: articles.length ? articles : undefined,
      directory: directory.length ? directory : undefined,
      fetchedAt: new Date().toISOString(),
    };
    await storage.setJson(CACHE_KEY, cache);
    return cache;
  } catch {
    return null;
  }
}
