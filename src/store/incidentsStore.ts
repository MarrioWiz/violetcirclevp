import * as Crypto from 'expo-crypto';
import { create } from 'zustand';

import { encryptedStorage } from '@/services/encryptedStorage';
import type { EvidenceFile, Incident } from '@/types';

const KEY_INCIDENTS = 'incidents';
const KEY_FILES = 'evidence';

export type IncidentInput = Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'history'>;

interface IncidentsState {
  incidents: Incident[];
  files: EvidenceFile[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  create: (input: IncidentInput) => Promise<Incident>;
  update: (id: string, patch: Partial<IncidentInput>) => Promise<void>;
  remove: (id: string) => Promise<EvidenceFile[]>;
  addFile: (file: EvidenceFile) => Promise<void>;
  removeFile: (fileId: string) => Promise<EvidenceFile | undefined>;
  logAlert: (what: string) => Promise<void>;
  reset: () => void;
}

const now = () => new Date().toISOString();

export const useIncidents = create<IncidentsState>((set, get) => {
  const saveIncidents = async (incidents: Incident[]) => {
    set({ incidents });
    await encryptedStorage.write(KEY_INCIDENTS, incidents);
  };
  const saveFiles = async (files: EvidenceFile[]) => {
    set({ files });
    await encryptedStorage.write(KEY_FILES, files);
  };
  return {
    incidents: [],
    files: [],
    hydrated: false,
    hydrate: async () => {
      const [incidents, files] = await Promise.all([
        encryptedStorage.read<Incident[]>(KEY_INCIDENTS, []),
        encryptedStorage.read<EvidenceFile[]>(KEY_FILES, []),
      ]);
      set({ incidents, files, hydrated: true });
    },
    create: async (input) => {
      const t = now();
      const incident: Incident = { ...input, id: Crypto.randomUUID(), createdAt: t, updatedAt: t, history: [] };
      await saveIncidents([incident, ...get().incidents]);
      return incident;
    },
    update: async (id, patch) => {
      // No se sobrescribe en silencio: la versión anterior queda en el historial.
      await saveIncidents(
        get().incidents.map((i) => {
          if (i.id !== id) return i;
          const changed = (patch.description !== undefined && patch.description !== i.description) || (patch.notes !== undefined && patch.notes !== i.notes);
          const history = changed
            ? [{ savedAt: i.updatedAt, description: i.description, notes: i.notes }, ...i.history].slice(0, 20)
            : i.history;
          return { ...i, ...patch, history, updatedAt: now() };
        }),
      );
    },
    remove: async (id) => {
      const removedFiles = get().files.filter((f) => f.incidentId === id);
      await saveIncidents(get().incidents.filter((i) => i.id !== id));
      await saveFiles(get().files.filter((f) => f.incidentId !== id));
      return removedFiles;
    },
    addFile: async (file) => {
      await saveFiles([...get().files, file]);
      await get().update(file.incidentId, {});
    },
    removeFile: async (fileId) => {
      const file = get().files.find((f) => f.id === fileId);
      await saveFiles(get().files.filter((f) => f.id !== fileId));
      return file;
    },
    logAlert: async (what) => {
      await get().create({
        occurredAt: now(),
        platform: 'otra',
        title: 'Usé la alerta rápida',
        description: what,
        links: [],
        isAlertLog: true,
      });
    },
    reset: () => set({ incidents: [], files: [], hydrated: true }),
  };
});
