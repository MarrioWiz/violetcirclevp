import {
  approximateCoords,
  buildAlertMessage,
  isValidPhone,
  mapsLink,
  normalizePhone,
  recipients,
  whatsappUrl,
} from '@/features/circle/message';
import type { CircleContact } from '@/types';

const contacts: CircleContact[] = [
  { id: 'a', name: 'Ana', phone: '222 123 4567', createdAt: '' },
  { id: 'b', name: 'Mamá', phone: '+52 (222) 765-4321', createdAt: '' },
  { id: 'c', name: 'Luz', phone: '2229998877', createdAt: '' },
];

describe('mensajes del círculo', () => {
  it('sin ubicación, el mensaje es el texto tal cual (recortado)', () => {
    expect(buildAlertMessage('  Necesito apoyo. ¿Puedes hablar conmigo?  ')).toBe(
      'Necesito apoyo. ¿Puedes hablar conmigo?',
    );
  });

  it('con ubicación agrega un enlace de mapas aproximado (3 decimales)', () => {
    const msg = buildAlertMessage('Necesito apoyo.', { lat: 19.0414398, lng: -98.2062727 });
    expect(msg).toContain('https://maps.google.com/?q=19.041,-98.206');
    expect(msg).not.toContain('19.04143');
  });

  it('redondea coordenadas (~100 m)', () => {
    expect(approximateCoords(19.04149, -98.20651)).toEqual({ lat: 19.041, lng: -98.207 });
    expect(mapsLink(1.5, -2.25)).toBe('https://maps.google.com/?q=1.500,-2.250');
  });

  it('solo incluye a las personas elegidas, con teléfonos normalizados', () => {
    expect(recipients(contacts, ['a', 'b'])).toEqual(['2221234567', '+522227654321']);
    expect(recipients(contacts, [])).toEqual([]);
  });

  it('valida teléfonos de México e internacionales', () => {
    expect(isValidPhone('222 123 4567')).toBe(true);
    expect(isValidPhone('+52 222 123 4567')).toBe(true);
    expect(isValidPhone('12345')).toBe(false);
    expect(isValidPhone('hola')).toBe(false);
    expect(normalizePhone(' +52 (222) 1-2 ')).toBe('+5222212');
  });

  it('WhatsApp: texto codificado; con una persona agrega lada 52', () => {
    expect(whatsappUrl('¿Hola?')).toBe('https://wa.me/?text=%C2%BFHola%3F');
    expect(whatsappUrl('Hola', '222 123 4567')).toBe('https://wa.me/522221234567?text=Hola');
    expect(whatsappUrl('Hola', '+52 222 123 4567')).toBe('https://wa.me/522221234567?text=Hola');
  });
});
