import { LOCKOUT_STEPS_MS, MAX_ATTEMPTS, lockoutFor, useSession } from '@/store/sessionStore';
import { buildSosMessage, isSosPath, preciseMapsLink, sosSecondsFromPath, sosTokenFromPath } from '@/features/sos/message';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('alerta "Pedir ayuda"', () => {
  const at = new Date(2026, 9, 6, 21, 5);

  it('incluye enlace de mapas preciso (6 decimales), margen y hora', () => {
    const msg = buildSosMessage({ lat: 19.0414398, lng: -98.2062727, accuracy: 12.4 }, at);
    expect(msg).toContain('https://maps.google.com/?q=19.041440,-98.206273');
    expect(msg).toContain('±12 m');
    expect(msg).toContain('Enviado a las 21:05.');
    expect(msg).toContain('llama al 911');
    expect(msg.startsWith('AYUDA: necesito ayuda urgente.')).toBe(true);
  });

  it('sin ubicación pide que la llamen', () => {
    expect(buildSosMessage(null, at)).toBe(
      'AYUDA: necesito ayuda urgente. No pude enviar mi ubicación. Llámame o ven, por favor. Si no contesto, llama al 911. Enviado a las 21:05.',
    );
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

  it('lee la clave secreta del enlace (sin clave no hay alerta)', () => {
    expect(sosTokenFromPath('violetcirclevp://sos?k=0123456789abcdef0123&t=4')).toBe('0123456789abcdef0123');
    expect(sosTokenFromPath('violetcirclevp://sos')).toBeNull();
    expect(sosTokenFromPath('violetcirclevp://sos?k=corta')).toBeNull();
  });

  it('segundos para cancelar desde la mini app', () => {
    expect(sosSecondsFromPath('violetcirclevp://sos?t=4')).toBe(4);
    expect(sosSecondsFromPath('/sos?from=x&t=6')).toBe(6);
    expect(sosSecondsFromPath('violetcirclevp://sos')).toBeUndefined();
    expect(sosSecondsFromPath('/sos?t=1')).toBeUndefined();
    expect(sosSecondsFromPath('/sos?t=99')).toBeUndefined();
  });
});

describe('bloqueo por errores de PIN', () => {
  it('cada tanda de 5 errores alarga la espera', () => {
    useSession.setState({ failedAttempts: 0, lockoutUntil: 0, lockoutLevel: 0 });
    const before = Date.now();
    for (let i = 0; i < MAX_ATTEMPTS; i++) useSession.getState().registerFailure();
    expect(useSession.getState().lockoutUntil - before).toBeGreaterThanOrEqual(LOCKOUT_STEPS_MS[0]);
    for (let i = 0; i < MAX_ATTEMPTS; i++) useSession.getState().registerFailure();
    expect(useSession.getState().lockoutLevel).toBe(2);
    expect(lockoutFor(10)).toBe(LOCKOUT_STEPS_MS[LOCKOUT_STEPS_MS.length - 1]);
  });

  it('al desbloquear se reinicia', () => {
    useSession.getState().unlock();
    expect(useSession.getState().lockoutLevel).toBe(0);
  });
});
