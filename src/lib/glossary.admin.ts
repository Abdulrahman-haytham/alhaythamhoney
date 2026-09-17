import 'server-only';
import type { Prisma } from '@prisma/client';
import type { z } from 'zod';
import type { glossaryInput } from '@/lib/validation';

/** يفصل معرّفات المنتجات عن حقول المدخل نفسه (علاقة m-n تُضبط بـ set)، ويُزيل تكرار المصفوفات. */
export function toGlossaryData(input: z.infer<typeof glossaryInput>) {
  const { productIds, aliases, sources, ...rest } = input;
  return {
    ...rest,
    aliases: [...new Set(aliases)],
    sources: [...new Set(sources)],
    products: { set: productIds.map((id) => ({ id })) },
  };
}

/**
 * يضمن وجود صفّ مرحلة لكل اسم تصنيف يستخدمه مدخل — يُستدعى عند حفظ مدخل بتصنيف جديد
 * حتى تظهر كل الأسماء المستخدَمة في لوحة المراحل، ولو كتبها الأدمن حرّاً في محرّر المدخل.
 */
export async function ensureGlossaryCategory(tx: Prisma.TransactionClient, name: string) {
  const existing = await tx.glossaryCategory.findUnique({ where: { name }, select: { id: true } });
  if (existing) return;
  const last = await tx.glossaryCategory.findFirst({
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });
  await tx.glossaryCategory.create({ data: { name, sortOrder: (last?.sortOrder ?? -1) + 1 } });
}
