/** Texto del SMS de "Pedir ayuda". Sin el nombre de la app, para no exponerla. Lógica pura (con pruebas). */

export interface SosLocation {
  lat: number;
  lng: number;
  /** Margen de error en metros, si el teléfono lo reporta. */
  accuracy?: number | null;
}

export const SOS_BASE_MESSAGE = 'AYUDA: necesito ayuda urgente.';

export function preciseMapsLink(loc: SosLocation): string {
  return `https://maps.google.com/?q=${loc.lat.toFixed(6)},${loc.lng.toFixed(6)}`;
}

function hhmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * Mensaje claro para quien lo recibe: qué pasa, dónde está, qué hacer y a qué hora se envió.
 * Sin el nombre de la app. Ej.:
 * "AYUDA: necesito ayuda urgente. Estoy aquí: https://maps… (precisión ±12 m). Llámame o ven,
 *  por favor. Si no contesto, llama al 911. Enviado a las 21:05."
 */
export function buildSosMessage(loc: SosLocation | null, date = new Date(), base = SOS_BASE_MESSAGE): string {
  const sent = `Enviado a las ${hhmm(date)}.`;
  const ask = 'Llámame o ven, por favor. Si no contesto, llama al 911.';
  if (!loc) return `${base} No pude enviar mi ubicación. ${ask} ${sent}`;
  const margin = loc.accuracy ? ` (precisión ±${Math.round(loc.accuracy)} m)` : '';
  return `${base} Estoy aquí: ${preciseMapsLink(loc)}${margin}. ${ask} ${sent}`;
}

/**
 * Segundos para cancelar pedidos en el enlace (violetcirclevp://sos?t=4, desde la mini app).
 * Entre 3 y 30; si no viene o no es válido, undefined (se usan los 10 s de siempre).
 */
export function sosSecondsFromPath(path: string): number | undefined {
  const m = /[?&]t=(\d{1,2})(&|$)/.exec(path);
  if (!m) return undefined;
  const n = Number(m[1]);
  return n >= 3 && n <= 30 ? n : undefined;
}

/** ¿El enlace entrante es la alerta? Acepta violetcirclevp://sos, /sos y /sos?x=1. */
export function isSosPath(path: string): boolean {
  return /(^|\/\/|\/)sos(\/|\?|$)/.test(path);
}
