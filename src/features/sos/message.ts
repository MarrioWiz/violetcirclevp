/** Texto del SMS de "Pedir ayuda". Sin el nombre de la app, para no exponerla. Lógica pura (con pruebas). */

export interface SosLocation {
  lat: number;
  lng: number;
  /** Margen de error en metros, si el teléfono lo reporta. */
  accuracy?: number | null;
}

export const SOS_BASE_MESSAGE = 'Necesito ayuda urgente.';

export function preciseMapsLink(loc: SosLocation): string {
  return `https://maps.google.com/?q=${loc.lat.toFixed(6)},${loc.lng.toFixed(6)}`;
}

function hhmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function buildSosMessage(loc: SosLocation | null, date = new Date(), base = SOS_BASE_MESSAGE): string {
  const time = `(${hhmm(date)})`;
  if (!loc) return `${base} No pude compartir mi ubicación. Llámame. ${time}`;
  const margin = loc.accuracy ? ` ±${Math.round(loc.accuracy)} m` : '';
  return `${base} Mi ubicación${margin}: ${preciseMapsLink(loc)} ${time}`;
}

/** ¿El enlace entrante es la alerta? Acepta violetcirclevp://sos, /sos y /sos?x=1. */
export function isSosPath(path: string): boolean {
  return /(^|\/\/|\/)sos(\/|\?|$)/.test(path);
}
