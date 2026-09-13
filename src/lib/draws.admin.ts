import 'server-only';
import type { z } from 'zod';
import type { drawInput } from '@/lib/validation';

export function toDrawData(input: z.infer<typeof drawInput>) {
  return {
    ...input,
    startsAt: new Date(`${input.startsAt}T00:00:00Z`),
    // تاريخ الانتهاء يشمل يومه كاملاً
    endsAt: new Date(`${input.endsAt}T23:59:59.999Z`),
  };
}
