import { Platform } from 'react-native';
import { create } from 'zustand';

import { notify } from '@/lib/dialog';
import { storage } from '@/services/storage';

/**
 * Simulación en web de lo que solo existe en el APK de Android (botones, SMS automático,
 * ícono discreto, recordatorios). Sirve para mostrar la app completa desde el navegador:
 * los interruptores se guardan y se ven, pero NO hacen nada real.
 */
export const SIMULATED = Platform.OS === 'web';

interface SimFlags {
  volume: boolean;
  launcher: boolean;
  shortcut: boolean;
  sms: boolean;
  discreetIcon: boolean;
  reminders: boolean;
}

const KEY = 'web-sim-flags';
const DEFAULTS: SimFlags = {
  volume: false,
  launcher: false,
  shortcut: false,
  sms: false,
  discreetIcon: false,
  reminders: false,
};

export const useWebSim = create<SimFlags & { set: (patch: Partial<SimFlags>) => void }>((set, get) => ({
  ...DEFAULTS,
  set: (patch) => {
    set(patch);
    const { set: _s, ...flags } = get();
    void storage.setJson(KEY, flags);
  },
}));

if (SIMULATED) {
  void storage.getJson<Partial<SimFlags>>(KEY, {}).then((saved) => useWebSim.setState({ ...DEFAULTS, ...saved }));
}

const sim = () => useWebSim.getState();

/** Misma forma que el módulo nativo `VcvpSos`, para usarlo igual en las pantallas. */
export const sosSim = {
  isVolumeTriggerEnabled: () => sim().volume,
  openAccessibilitySettings: () => {
    sim().set({ volume: !sim().volume });
    notify(
      sim().volume
        ? 'Simulación: en Android aquí se abriría Accesibilidad para activar "3 veces bajar volumen". Lo marcamos como activado.'
        : 'Simulación: botones de volumen desactivados.',
    );
  },
  isLauncherEntryEnabled: () => sim().launcher,
  setLauncherEntryEnabled: (on: boolean) => sim().set({ launcher: on }),
  isIconShortcutEnabled: () => sim().shortcut,
  setIconShortcutEnabled: (on: boolean) => {
    sim().set({ shortcut: on });
    return true;
  },
};
