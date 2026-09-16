import 'server-only';
import type { z } from 'zod';
import type { glossaryInput } from '@/lib/validation';

/** يفصل معرّفات المنتجات عن حقول المدخل نفسه (علاقة m-n تُضبط بـ set). */
export function toGlossaryData(input: z.infer<typeof glossaryInput>) {
  const { productIds, ...rest } = input;
  return { ...rest, products: { set: productIds.map((id) => ({ id })) } };
}
