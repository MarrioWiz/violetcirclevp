import type { CircleContact } from '@/types';

/** Redondea a 3 decimales (~110 m): "ubicación aproximada". */
export function approximateCoords(lat: number, lng: number): { lat: number; lng: number } {
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return { lat: r(lat), lng: r(lng) };
}

export function mapsLink(lat: number, lng: number): string {
  const c = approximateCoords(lat, lng);
  return `https://maps.google.com/?q=${c.lat.toFixed(3)},${c.lng.toFixed(3)}`;
}

export function buildAlertMessage(base: string, location?: { lat: number; lng: number } | null): string {
  const text = base.trim();
  if (!location) return text;
  return `${text}\n\nMi ubicación aproximada: ${mapsLink(location.lat, location.lng)}`;
}

/** Deja solo dígitos y un "+" inicial. */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const plus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  return plus ? `+${digits}` : digits;
}

/** 10 dígitos (México) o formato internacional de 8 a 15 dígitos con "+". */
export function isValidPhone(raw: string): boolean {
  const p = normalizePhone(raw);
  if (p.startsWith('+')) return /^\+\d{8,15}$/.test(p);
  return /^\d{10}$/.test(p) || /^\d{12,13}$/.test(p);
}

export function recipients(contacts: CircleContact[], selectedIds: string[]): string[] {
  const selected = new Set(selectedIds);
  return contacts.filter((c) => selected.has(c.id)).map((c) => normalizePhone(c.phone));
}

/** WhatsApp no permite varios destinatarios por enlace: ella elige el chat. */
export function whatsappUrl(text: string, phone?: string): string {
  const encoded = encodeURIComponent(text);
  if (phone) {
    const digits = normalizePhone(phone).replace('+', '');
    const intl = digits.length === 10 ? `52${digits}` : digits;
    return `https://wa.me/${intl}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}
