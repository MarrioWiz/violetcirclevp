import { create } from 'zustand';

import { storage } from '@/services/storage';
import type { Settings } from '@/types';

export const DISCLAIMER_VERSION = 1;

export const defaultSettings: Settings = {
  onboarded: false,
  consentAt: null,
  disclaimerVersion: 0,
  biometrics: false,
  autolock: 'immediate',
  hidePreview: true,
  theme: 'system',
  textScale: 1,
  statsOptIn: false,
  notificationsDiscreet: true,
  selfCareReminders: false,
  quickExitTipSeen: false,
};

interface SettingsState extends Settings {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  update: (patch: Partial<Settings>) => Promise<void>;
  reset: () => void;
}

// Los ajustes no contienen información del incidente, por eso se guardan sin cifrar.
const KEY = 'settings';

export const useSettings = create<SettingsState>((set, get) => ({
  ...defaultSettings,
  hydrated: false,
  hydrate: async () => {
    const saved = await storage.getJson<Partial<Settings>>(KEY, {});
    set({ ...defaultSettings, ...saved, hydrated: true });
  },
  update: async (patch) => {
    set(patch);
    const { hydrated: _h, hydrate: _hy, update: _u, reset: _r, ...current } = get();
    await storage.setJson(KEY, current);
  },
  reset: () => set({ ...defaultSettings, hydrated: true }),
}));
