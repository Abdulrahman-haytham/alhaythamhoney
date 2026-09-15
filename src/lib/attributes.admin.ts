import 'server-only';
import type { Prisma } from '@prisma/client';

/**
 * يزامن قيم الخاصية مع قائمة نصية: القيم الموجودة بالنص نفسه تبقى بمعرّفها
 * (وتبقى مربوطة بمنتجاتها)، الغائبة تُحذف، الجديدة تُنشأ، والترتيب من القائمة.
 */
export async function syncAttributeValues(
  tx: Prisma.TransactionClient,
  attributeId: string,
  values: string[],
) {
  const wanted = values.map((v) => v.trim()).filter(Boolean);
  const existing = await tx.attributeValue.findMany({ where: { attributeId } });
  const stale = existing.filter((e) => !wanted.includes(e.value)).map((e) => e.id);
  if (stale.length) await tx.attributeValue.deleteMany({ where: { id: { in: stale } } });
  for (const [sortOrder, value] of wanted.entries()) {
    const found = existing.find((e) => e.value === value);
    if (found) await tx.attributeValue.update({ where: { id: found.id }, data: { sortOrder } });
    else await tx.attributeValue.create({ data: { attributeId, value, sortOrder } });
  }
}
