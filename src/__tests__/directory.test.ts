import directoryJson from '@/assets/content/directory.json';
import { PENDING, isPublishable, pendingCount, visibleEntries } from '@/features/directory/filter';
import type { DirectoryEntry } from '@/types';

const bundledEntries = directoryJson.entries as DirectoryEntry[];

const base: DirectoryEntry = {
  id: 'x',
  name: 'Institución',
  type: 'mujeres',
  description: 'Atiende',
  phone: '2220000000',
  whatToExpect: 'Te escuchan',
  verified: true,
  verifiedAt: '2026-10-01',
  source: 'Sitio oficial',
  scope: 'puebla',
};

describe('reglas del directorio', () => {
  it('con los datos empaquetados se ven solo los contactos verificados por el equipo', () => {
    const visible = visibleEntries(bundledEntries);
    expect(visible.map((e) => e.id).sort()).toEqual(
      ['emergencias-911', 'fiscalia-puebla', 'policia-cibernetica-puebla', 'telmujer-puebla', 'uvp-genero'].sort(),
    );
  });

  it('ninguna entrada no verificada es visible', () => {
    expect(visibleEntries([{ ...base, verified: false }])).toEqual([]);
  });

  it('aunque digan verified: true, se ocultan si tienen un dato pendiente', () => {
    expect(isPublishable({ ...base, phone: PENDING })).toBe(false);
    expect(isPublishable({ ...base, source: undefined })).toBe(false);
    expect(isPublishable({ ...base, verifiedAt: undefined })).toBe(false);
    expect(isPublishable(base)).toBe(true);
  });

  it('todo teléfono publicado tiene fuente, fecha de verificación y formato válido', () => {
    for (const e of visibleEntries(bundledEntries)) {
      expect(e.source).toBeTruthy();
      expect(e.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.whatToExpect).toBeTruthy();
      if (e.phone) expect(e.phone.replace(/\D/g, '')).toMatch(/^(911|\d{10})$/);
    }
  });

  it('filtra por tipo y cuenta pendientes', () => {
    const list = [base, { ...base, id: 'y', type: 'uvp' as const }, { ...base, id: 'z', verified: false }];
    expect(visibleEntries(list, 'uvp').map((e) => e.id)).toEqual(['y']);
    expect(visibleEntries(list, 'all')).toHaveLength(2);
    expect(pendingCount(list)).toBe(1);
  });
});
