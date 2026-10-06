import { create } from 'zustand';

import { storage } from '@/services/storage';

const DISGUISE_KEY = 'disguised';
export const MAX_ATTEMPTS = 5;
export const LOCKOUT_MS = 30_000;

interface SessionState {
  /** La app está bloqueada y pide PIN/biometría. */
  locked: boolean;
  /** Salida rápida activa: se muestra la calculadora en lugar de la app. */
  disguised: boolean;
  /** La app no está en primer plano: se tapa el contenido (app switcher). */
  covered: boolean;
  failedAttempts: number;
  lockoutUntil: number;
  /** Momento en que la app pasó a segundo plano (para el autobloqueo). */
  backgroundedAt: number | null;
  hydrateDisguise: () => Promise<void>;
  lock: () => void;
  unlock: () => void;
  setCovered: (covered: boolean) => void;
  setBackgroundedAt: (t: number | null) => void;
  registerFailure: () => void;
  quickExit: () => Promise<void>;
  leaveDisguise: () => Promise<void>;
}

export const useSession = create<SessionState>((set, get) => ({
  locked: true,
  disguised: false,
  covered: false,
  failedAttempts: 0,
  lockoutUntil: 0,
  backgroundedAt: null,
  hydrateDisguise: async () => {
    set({ disguised: (await storage.get(DISGUISE_KEY)) === '1' });
  },
  lock: () => set({ locked: true }),
  unlock: () => set({ locked: false, failedAttempts: 0, lockoutUntil: 0 }),
  setCovered: (covered) => set({ covered }),
  setBackgroundedAt: (backgroundedAt) => set({ backgroundedAt }),
  registerFailure: () => {
    const attempts = get().failedAttempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      set({ failedAttempts: 0, lockoutUntil: Date.now() + LOCKOUT_MS });
    } else {
      set({ failedAttempts: attempts });
    }
  },
  quickExit: async () => {
    // Bloquea y disfraza al mismo tiempo: al volver hay que escribir el PIN.
    set({ disguised: true, locked: true });
    await storage.set(DISGUISE_KEY, '1');
  },
  leaveDisguise: async () => {
    set({ disguised: false, locked: false, failedAttempts: 0 });
    await storage.remove(DISGUISE_KEY);
  },
}));
