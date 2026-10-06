import { buildSosMessage, isSosPath, preciseMapsLink } from '@/features/sos/message';

describe('alerta "Pedir ayuda"', () => {
  const at = new Date(2026, 9, 6, 21, 5);

  it('incluye enlace de mapas preciso (6 decimales), margen y hora', () => {
    const msg = buildSosMessage({ lat: 19.0414398, lng: -98.2062727, accuracy: 12.4 }, at);
    expect(msg).toContain('https://maps.google.com/?q=19.041440,-98.206273');
    expect(msg).toContain('±12 m');
    expect(msg).toContain('(21:05)');
    expect(msg.startsWith('Necesito ayuda urgente.')).toBe(true);
  });

  it('sin ubicación pide que la llamen', () => {
    expect(buildSosMessage(null, at)).toBe('Necesito ayuda urgente. No pude compartir mi ubicación. Llámame. (21:05)');
  });

  it('no menciona el nombre de la app (discreción)', () => {
    expect(buildSosMessage({ lat: 1, lng: 2 }, at).toLowerCase()).not.toContain('violet');
  });

  it('enlace de mapas', () => {
    expect(preciseMapsLink({ lat: 1.5, lng: -2.25 })).toBe('https://maps.google.com/?q=1.500000,-2.250000');
  });

  it('reconoce el enlace de la alerta y no otros', () => {
    expect(isSosPath('violetcirclevp://sos')).toBe(true);
    expect(isSosPath('/sos')).toBe(true);
    expect(isSosPath('/sos?from=volumen')).toBe(true);
    expect(isSosPath('/bitacora')).toBe(false);
    expect(isSosPath('/sosten')).toBe(false);
    expect(isSosPath('/guia/sos-falso')).toBe(false);
  });
});
