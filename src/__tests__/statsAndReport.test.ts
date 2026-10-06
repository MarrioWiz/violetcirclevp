import { auditLevel } from '@/features/content/audit';
import { buildIncidentReportHtml, escapeHtml } from '@/features/evidence/pdfHtml';
import { parseLinks } from '@/features/evidence/schema';
import { isoWeek } from '@/features/stats/isoWeek';
import type { Incident } from '@/types';

jest.mock('firebase/firestore', () => ({ addDoc: jest.fn(), collection: jest.fn() }));
jest.mock('@/services/firebase', () => ({ getDb: () => null, ensureAnonymousSession: async () => null }));
jest.mock('@/store/settingsStore', () => ({ useSettings: { getState: () => ({ statsOptIn: false }) } }));

// eslint-disable-next-line import/first
import { buildStat } from '@/features/stats/sendStat';

describe('estadísticas anónimas', () => {
  it('solo contiene kind, platform y week (sin identificadores)', () => {
    const stat = buildStat('ciberacoso', 'instagram', new Date('2026-10-05T12:00:00Z'));
    expect(Object.keys(stat).sort()).toEqual(['kind', 'platform', 'week']);
    expect(stat).toEqual({ kind: 'ciberacoso', platform: 'instagram', week: '2026-W41' });
  });

  it('plataformas desconocidas se agrupan como "otra"', () => {
    expect(buildStat('otro', undefined).platform).toBe('otra');
    expect(buildStat('otro', 'myspace').platform).toBe('otra');
  });

  it('semana ISO en cambio de año', () => {
    expect(isoWeek(new Date('2027-01-01T12:00:00'))).toBe('2026-W53');
  });
});

describe('PDF de la bitácora', () => {
  const incident: Incident = {
    id: 'i1',
    occurredAt: '2026-10-01T18:30:00.000Z',
    platform: 'whatsapp',
    type: 'amenazas',
    title: 'Mensajes <script>',
    description: 'Me escribió "esto"\notra línea',
    links: ['https://example.com/a'],
    createdAt: '2026-10-01T19:00:00.000Z',
    updatedAt: '2026-10-01T19:00:00.000Z',
    history: [],
  };

  it('escapa HTML para que el contenido no rompa el documento', () => {
    expect(escapeHtml('<b>"x" & \'y\'</b>')).toBe('&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;');
    const html = buildIncidentReportHtml([incident], []);
    expect(html).not.toContain('<script>');
    expect(html).toContain('Mensajes &lt;script&gt;');
    expect(html).toContain('otra línea');
  });

  it('incluye el hash de cada archivo', () => {
    const sha = 'a'.repeat(64);
    const html = buildIncidentReportHtml(
      [incident],
      [
        {
          id: 'f',
          incidentId: 'i1',
          localUri: 'file://x',
          name: 'cap.png',
          mime: 'image/png',
          sha256: sha,
          size: 2048,
          addedAt: '2026-10-01T19:05:00.000Z',
        },
      ],
    );
    expect(html).toContain(`SHA-256: ${sha}`);
    expect(html).toContain('cap.png');
  });

  it('enlaces: uno por línea, sin vacíos ni repetidos', () => {
    expect(parseLinks('a\n\n b \na\r\nc')).toEqual(['a', 'b', 'c']);
    expect(parseLinks(undefined)).toEqual([]);
  });
});

describe('autoevaluación', () => {
  const levels = [
    { min: 0, title: 'Inicio', body: '' },
    { min: 4, title: 'Medio', body: '' },
    { min: 8, title: 'Alto', body: '' },
  ];
  it('resultado cualitativo por niveles', () => {
    expect(auditLevel(levels, 0).title).toBe('Inicio');
    expect(auditLevel(levels, 5).title).toBe('Medio');
    expect(auditLevel(levels, 10).title).toBe('Alto');
  });
});
