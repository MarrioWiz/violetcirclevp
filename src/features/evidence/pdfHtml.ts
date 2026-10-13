import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import type { EvidenceFile, Incident } from '@/types';

export const PLATFORM_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  otra: 'Correo u otra',
  presencial: 'En persona',
};

export const KIND_LABEL: Record<string, string> = {
  riesgo: 'Riesgo inmediato',
  ciberacoso: 'Ciberacoso',
  sextorsion: 'Sextorsión',
  doxing: 'Doxing',
  suplantacion: 'Suplantación de identidad',
  difusion: 'Difusión de contenido íntimo sin consentimiento',
  grooming: 'Grooming',
  amenazas: 'Amenazas',
  presencial: 'Acoso en persona',
  otro: 'Otro',
};

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const fmt = (iso: string) => format(new Date(iso), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });

export interface PdfEvidence extends EvidenceFile {
  /** data: URI de la imagen (solo para imágenes). */
  dataUri?: string;
}

/** Arma el expediente en orden cronológico (más antiguo primero). */
export function buildIncidentReportHtml(incidents: Incident[], files: PdfEvidence[], generatedAt = new Date()): string {
  const ordered = [...incidents].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const rows = ordered
    .map((inc, idx) => {
      const own = files.filter((f) => f.incidentId === inc.id);
      const evidence = own.length
        ? `<h4>Evidencia adjunta (${own.length})</h4>` +
          own
            .map(
              (f) => `
          <div class="ev">
            ${f.dataUri && f.mime.startsWith('image/') ? `<img src="${f.dataUri}" alt="${escapeHtml(f.name)}"/>` : '<div class="doc">Documento</div>'}
            <div class="meta">
              <div><b>${escapeHtml(f.name)}</b> · ${escapeHtml(f.mime)} · ${(f.size / 1024).toFixed(0)} KB</div>
              <div>Adjuntado: ${fmt(f.addedAt)}</div>
              <div class="hash">SHA-256: ${f.sha256}</div>
            </div>
          </div>`,
            )
            .join('')
        : '';
      const links = inc.links.length
        ? `<p><b>Enlaces:</b><br/>${inc.links.map((l) => escapeHtml(l)).join('<br/>')}</p>`
        : '';
      return `
      <section>
        <h3>${idx + 1}. ${escapeHtml(inc.title)}</h3>
        <p class="sub">${fmt(inc.occurredAt)} · ${PLATFORM_LABEL[inc.platform] ?? escapeHtml(inc.platform)}${inc.type ? ` · ${KIND_LABEL[inc.type] ?? ''}` : ''}</p>
        <p>${escapeHtml(inc.description).replace(/\n/g, '<br/>')}</p>
        ${inc.involved ? `<p><b>Personas o usuarios involucrados:</b> ${escapeHtml(inc.involved)}</p>` : ''}
        ${links}
        ${inc.notes ? `<p><b>Notas:</b> ${escapeHtml(inc.notes).replace(/\n/g, '<br/>')}</p>` : ''}
        <p class="small">Registrado: ${fmt(inc.createdAt)} · Última edición: ${fmt(inc.updatedAt)}${inc.history.length ? ` · ${inc.history.length} versión(es) anterior(es)` : ''}</p>
        ${evidence}
      </section>`;
    })
    .join('');

  return `<!doctype html>
<html lang="es-MX"><head><meta charset="utf-8"/>
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1F1635; padding: 24px; font-size: 12px; }
  h1 { color: #4C1D95; font-size: 20px; margin: 0; }
  h3 { color: #4C1D95; margin: 0 0 4px; font-size: 15px; }
  h4 { margin: 12px 0 6px; font-size: 12px; }
  .sub { color: #5B5170; margin: 0 0 8px; }
  .small { color: #5B5170; font-size: 10px; }
  section { border-top: 1px solid #E6DFF7; padding: 14px 0; page-break-inside: avoid; }
  .ev { display: flex; gap: 10px; margin: 8px 0; page-break-inside: avoid; }
  .ev img { width: 140px; max-height: 220px; object-fit: contain; border: 1px solid #E6DFF7; border-radius: 6px; }
  .doc { width: 140px; height: 60px; display:flex; align-items:center; justify-content:center; background:#F4EFFE; border-radius:6px; }
  .meta { flex: 1; }
  .hash { font-family: Menlo, Courier, monospace; font-size: 9px; word-break: break-all; color: #3b3150; }
  .note { background: #F4EFFE; padding: 10px; border-radius: 8px; color: #4C1D95; margin: 12px 0; }
</style></head>
<body>
  <h1>Bitácora de incidentes</h1>
  <p class="sub">Generado el ${fmt(generatedAt.toISOString())} con VioletCircleVP · ${ordered.length} registro(s)</p>
  <div class="note">Documento personal y confidencial. Los códigos SHA-256 permiten comprobar que cada archivo de evidencia no fue modificado desde que se adjuntó. Este documento no sustituye una denuncia formal.</div>
  ${rows}
</body></html>`;
}
