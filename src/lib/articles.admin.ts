import 'server-only';
import type { z } from 'zod';
import type { articleInput } from '@/lib/validation';

/** الجسم قد يكون طويلاً (Markdown + HTML) فنسمح بحد أعلى من بقية الـ JSON. */
export const ARTICLE_BODY_LIMIT = 512 * 1024;

export function toArticleData(input: z.infer<typeof articleInput>) {
  return { ...input, publishedAt: new Date(`${input.publishedAt}T00:00:00Z`) };
}
