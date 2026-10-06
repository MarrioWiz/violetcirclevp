import { File } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { buildIncidentReportHtml, type PdfEvidence } from '@/features/evidence/pdfHtml';
import type { EvidenceFile, Incident } from '@/types';
import { markExternalNavigation } from '@/store/sessionStore';

import { evidenceDataUri } from './evidenceFiles';

async function withImages(files: EvidenceFile[]): Promise<PdfEvidence[]> {
  return Promise.all(
    files.map(async (f) => {
      if (!f.mime.startsWith('image/')) return f;
      try {
        return { ...f, dataUri: await evidenceDataUri(f) };
      } catch {
        return f;
      }
    }),
  );
}

export async function buildReportHtml(incidents: Incident[], files: EvidenceFile[]): Promise<string> {
  const ids = new Set(incidents.map((i) => i.id));
  return buildIncidentReportHtml(incidents, await withImages(files.filter((f) => ids.has(f.incidentId))));
}

/** Vista previa del sistema (iOS muestra el PDF antes de imprimir o compartir). */
export async function previewReport(html: string): Promise<void> {
  markExternalNavigation();
  await Print.printAsync({ html });
}

/** Genera el PDF, abre el menú de compartir y borra el archivo temporal. */
export async function shareReport(html: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html });
  try {
    markExternalNavigation();
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: 'Compartir bitácora',
    });
  } finally {
    try {
      const f = new File(uri);
      if (f.exists) f.delete();
    } catch {
      // ignorar
    }
  }
}
