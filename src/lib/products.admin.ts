import 'server-only';
import type { z } from 'zod';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import type { productInput } from '@/lib/validation';

type ProductData = z.infer<typeof productInput>;

/** بيانات المنتج نفسه بلا العلاقات (تُدار كلٌّ على حدة) */
export function toProductScalars(input: ProductData) {
  const { relatedIds: _r, variants: _v, tiers: _t, ...data } = input;
  return { ...data, detailedInfo: data.detailedInfo ?? Prisma.DbNull };
}

/**
 * يزامن المتغيّرات مع ما أرسله الأدمن مع الحفاظ على معرّفات الموجود منها —
 * فالمعرّف مكتوب في سلال الزبائن وبنود الطلبات، وتغييره يُسقط بنودهم.
 */
export async function syncVariants(
  tx: Prisma.TransactionClient,
  productId: string,
  variants: ProductData['variants'],
) {
  const existing = await tx.productVariant.findMany({ where: { productId }, select: { id: true } });
  const keep = new Set(variants.map((v) => v.id).filter((id): id is string => !!id));
  const toDelete = existing.filter((e) => !keep.has(e.id)).map((e) => e.id);
  if (toDelete.length) await tx.productVariant.deleteMany({ where: { id: { in: toDelete } } });
  // متغيّر افتراضي واحد فقط: الأول المعلَّم، وإلا الأول في القائمة
  const defaultIdx = Math.max(
    0,
    variants.findIndex((v) => v.isDefault),
  );
  for (const [sortOrder, v] of variants.entries()) {
    const data = {
      label: v.label,
      price: v.price,
      stockQty: v.stockQty,
      inStock: v.inStock,
      isDefault: sortOrder === defaultIdx,
      sortOrder,
    };
    if (v.id && existing.some((e) => e.id === v.id))
      await tx.productVariant.update({ where: { id: v.id }, data });
    else await tx.productVariant.create({ data: { ...data, productId } });
  }
}

export async function syncTiers(
  tx: Prisma.TransactionClient,
  productId: string,
  tiers: ProductData['tiers'],
) {
  await tx.priceTier.deleteMany({ where: { productId } });
  if (tiers.length)
    await tx.priceTier.createMany({ data: tiers.map((t) => ({ ...t, productId })) });
}

/** ما يعرضه المحرّر: المنتج مع متغيّراته وشرائحه بترتيبها */
export async function getAdminProducts() {
  return db.product.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      related: { orderBy: { sortOrder: 'asc' }, select: { relatedId: true } },
      variants: { orderBy: { sortOrder: 'asc' } },
      tiers: { orderBy: { minQty: 'asc' } },
    },
  });
}
