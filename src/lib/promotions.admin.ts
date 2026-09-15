import 'server-only';
import type { z } from 'zod';
import type { promotionInput } from '@/lib/validation';

const day = (d: string | null) => (d ? new Date(`${d}T00:00:00Z`) : null);
const endOfDay = (d: string | null) => (d ? new Date(`${d}T23:59:59.999Z`) : null);

export function toPromotionData(input: z.infer<typeof promotionInput>) {
  return { ...input, startsAt: day(input.startsAt), endsAt: endOfDay(input.endsAt) };
}
