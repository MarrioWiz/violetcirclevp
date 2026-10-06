import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { confirmDialog, notify } from '@/lib/dialog';
import { S } from '@/lib/strings.es';
import { useCircle } from '@/store/circleStore';
import { useIncidents } from '@/store/incidentsStore';
import { useSettings } from '@/store/settingsStore';

/**
 * Exporta sus datos en JSON legible (sin archivos binarios: esos van en el PDF).
 * El archivo temporal se borra después de compartir.
 */
export async function exportMyData(): Promise<void> {
  if (Platform.OS === 'web' || !(await Sharing.isAvailableAsync())) {
    notify(S.errors.generic);
    return;
  }
  const ok = await confirmDialog({
    title: S.settings.exportData,
    message: 'El archivo incluye tu círculo y tu bitácora sin cifrar. Compártelo solo con personas o lugares de confianza.',
    confirmLabel: S.common.continue,
  });
  if (!ok) return;

  const { incidents, files } = useIncidents.getState();
  const { hydrated: _h, hydrate: _hy, update: _u, reset: _r, ...settings } = useSettings.getState();
  const payload = {
    exportedAt: new Date().toISOString(),
    app: 'VioletCircleVP',
    circle: useCircle.getState().contacts,
    incidents,
    evidence: files.map(({ localUri: _uri, ...meta }) => meta),
    settings,
  };
  const file = new File(Paths.cache, `mis-datos-${Date.now()}.json`);
  try {
    file.write(JSON.stringify(payload, null, 2));
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: S.settings.exportData, UTI: 'public.json' });
  } catch {
    notify(S.errors.generic);
  } finally {
    try {
      if (file.exists) file.delete();
    } catch {
      // ignorar
    }
  }
}
