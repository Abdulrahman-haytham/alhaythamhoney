import 'server-only';
import type { z } from 'zod';
import { db } from '@/lib/db';
import type { batchInput } from '@/lib/validation';

export function toBatchData(input: z.infer<typeof batchInput>) {
  return {
    ...input,
    harvestDate: input.harvestDate ? new Date(`${input.harvestDate}T00:00:00Z`) : null,
  };
}

const batchSelect = {
  id: true,
  code: true,
  title: true,
  region: true,
  harvestDate: true,
  floralSource: true,
  moisture: true,
  labReportUrl: true,
  videoUrl: true,
  notes: true,
  published: true,
  product: { select: { id: true, slug: true, name: true, image: true } },
  _count: { select: { jarCodes: true } },
} as const;

/** جواز منشور برمزه (الأدمن يرى المسودّة أيضاً) */
export async function getBatchByCode(code: string, includeDrafts = false) {
  const batch = await db.batch.findUnique({ where: { code }, select: batchSelect });
  if (!batch || (!batch.published && !includeDrafts)) return null;
  return batch;
}

/** دفعات منشورة لمنتج — لقسم «دفعات هذا المنتج» في صفحته */
export async function getProductBatches(productId: string, take = 6) {
  return db.batch.findMany({
    where: { productId, published: true },
    orderBy: [{ harvestDate: 'desc' }, { createdAt: 'desc' }],
    take,
    select: { code: true, title: true, harvestDate: true, region: true, labReportUrl: true },
  });
}

/** رمز مرطبان → جوازه (إن رُبط) */
export async function getJarPassport(jarCode: string) {
  const jar = await db.jarCode.findUnique({
    where: { code: jarCode },
    select: { code: true, usedAt: true, passport: { select: { code: true, published: true } } },
  });
  return jar;
}
