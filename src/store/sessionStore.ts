import { create } from 'zustand';

import { storage } from '@/services/storage';

export type SosMode = 'external' | 'hold' | 'test';

const DISGUISE_KEY = 'disguised';
export const MAX_ATTEMPTS = 5;
export const LOCKOUT_MS = 30_000;
/** Si la app abrió otra app (cámara, Mensajes, compartir…), no se bloquea si vuelve antes de esto. */
export const EXTERNAL_GRACE_MS = 5 * 60_000;

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
  /** Hasta cuándo una salida a otra app iniciada por la propia app no provoca bloqueo. */
  externalUntil: number;
  markExternal: () => void;
  /** Pantalla "Pedir ayuda" activa (se muestra encima de todo, sin PIN). */
  sosActive: boolean;
  /** external = botón/volumen/atajo (10 s para cancelar), hold = círculo mantenido en la app, test = no envía. */
  sosMode: SosMode;
  setSosActive: (on: boolean, mode?: SosMode) => void;
  /** Se marca al empezar a enviar: si la pantalla se vuelve a montar, NO se reenvía. */
  sosSentAt: number | null;
  markSosSent: () => void;
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
  externalUntil: 0,
  sosActive: false,
  sosMode: 'external',
  setSosActive: (sosActive, mode = 'external') => set({ sosActive, sosMode: mode, sosSentAt: null }),
  sosSentAt: null,
  markSosSent: () => set({ sosSentAt: Date.now() }),
  markExternal: () => set({ externalUntil: Date.now() + EXTERNAL_GRACE_MS }),
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

/** Llamar justo antes de abrir otra app desde VioletCircleVP (selector, cámara, SMS, compartir…). */
export function markExternalNavigation(): void {
  useSession.getState().markExternal();
}
