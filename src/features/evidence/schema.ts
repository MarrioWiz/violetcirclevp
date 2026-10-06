import { z } from 'zod';

import { S } from '@/lib/strings.es';

export const PLATFORM_VALUES = ['whatsapp', 'instagram', 'tiktok', 'facebook', 'otra'] as const;
export const KIND_VALUES = [
  'ciberacoso',
  'sextorsion',
  'doxing',
  'suplantacion',
  'difusion',
  'grooming',
  'amenazas',
  'otro',
] as const;

export const incidentSchema = z.object({
  title: z.string().trim().min(1, S.journal.errors.title).max(80),
  occurredAt: z.date(),
  platform: z.enum(PLATFORM_VALUES),
  type: z.enum(KIND_VALUES).optional(),
  description: z.string().trim().min(1, S.journal.errors.description).max(5000),
  involved: z.string().trim().max(300).optional(),
  linksText: z.string().max(2000).optional(),
  mood: z.number().int().min(1).max(5).optional(),
  notes: z.string().trim().max(3000).optional(),
  locked: z.boolean(),
});

export type IncidentFormValues = z.infer<typeof incidentSchema>;

/** Un enlace por línea; descarta vacíos y repetidos. */
export function parseLinks(text: string | undefined): string[] {
  if (!text) return [];
  return Array.from(
    new Set(
      text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean),
    ),
  );
}
