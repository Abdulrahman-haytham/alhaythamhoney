import 'server-only';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';

/** ما تحتاجه بطاقات المنتج وصفحته: المتغيّرات وشرائح الكمية مع المنتج */
export const productListInclude = {
  variants: { orderBy: { sortOrder: 'asc' } },
  tiers: { orderBy: { minQty: 'asc' } },
} satisfies Prisma.ProductInclude;

export type CatalogProduct = Prisma.ProductGetPayload<{ include: typeof productListInclude }>;

/**
 * كل المنتجات المنشورة — المتوفر وغير المتوفر معاً.
 * غير المتوفر يبقى معروضاً بشارة تنبيه (لا يُخفى) حتى يرى الزائر الكتالوج كاملاً
 * ويعرف أن الصنف موجود لكنه نفد؛ الإخفاء الكامل يتم بإلغاء النشر من لوحة الإدارة.
 * الترتيب يقدّم المتوفر أولاً.
 */
export async function getProducts() {
  return db.product.findMany({
    where: { published: true },
    orderBy: [{ inStock: 'desc' }, { sortOrder: 'asc' }],
    include: productListInclude,
  });
}

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({ where: { slug, published: true }, include: productListInclude });
}

/**
 * «يُشترى معه عادةً»: اختيارات الأدمن أولاً؛ وإن لم يختر شيئاً ومُفعَّل الاقتراح
 * التلقائي، نكمل بمنتجات متوفرة من الفئة نفسها ثم من الفئة الأخرى.
 */
export async function getRelatedProducts(
  productId: string,
  category: 'HONEY' | 'SUPPLEMENT',
  auto: boolean,
  limit = 4,
) {
  const manual = await db.productRelation.findMany({
    where: { productId, related: { published: true } },
    orderBy: { sortOrder: 'asc' },
    include: { related: { include: productListInclude } },
  });
  const picked = manual.map((r) => r.related);
  if (picked.length >= limit || !auto) return picked.slice(0, limit);
  const fill = await db.product.findMany({
    where: {
      published: true,
      inStock: true,
      id: { notIn: [productId, ...picked.map((p) => p.id)] },
    },
    // ترتيب enum في PostgreSQL: HONEY ثم SUPPLEMENT — فنقلبه حين تكون الفئة SUPPLEMENT
    orderBy: [{ category: category === 'HONEY' ? 'asc' : 'desc' }, { sortOrder: 'asc' }],
    take: limit - picked.length,
    include: productListInclude,
  });
  return [...picked, ...fill];
}

/** المقالات المنشورة التي ربطها الأدمن بهذا المنتج. */
export async function getProductArticles(productId: string) {
  return db.article.findMany({
    where: {
      published: true,
      publishedAt: { lte: new Date() },
      products: { some: { id: productId } },
    },
    orderBy: { publishedAt: 'desc' },
    select: { slug: true, title: true, description: true, image: true },
    take: 3,
  });
}
