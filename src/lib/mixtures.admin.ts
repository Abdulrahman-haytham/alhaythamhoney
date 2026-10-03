import 'server-only';
import type { z } from 'zod';
import type { mixtureInput } from '@/lib/validation';

export type MixtureData = z.infer<typeof mixtureInput>;

/** حقول الخلطة نفسها (بلا المكوّنات) كما تُكتب في القاعدة. */
export function toMixtureScalars({ ingredients: _ingredients, ...data }: MixtureData) {
  return data;
}

/** حقول المكوّن مع ترتيبه كما رتّبه الأدمن. */
export function toIngredientData(
  { id: _id, note, ...data }: MixtureData['ingredients'][number],
  sortOrder: number,
) {
  return { ...data, note: note?.trim() ? note.trim() : null, sortOrder };
}
