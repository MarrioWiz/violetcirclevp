import { z } from 'zod';

import { S } from '@/lib/strings.es';

import { isValidPhone } from './message';

export const contactSchema = z.object({
  name: z.string().trim().min(1, S.circle.errors.name).max(40, S.circle.errors.name),
  phone: z.string().trim().refine(isValidPhone, S.circle.errors.phone),
  role: z.enum(['amiga', 'familiar', 'companera', 'profesora', 'pareja', 'otra']).optional(),
});

export type ContactForm = z.infer<typeof contactSchema>;
