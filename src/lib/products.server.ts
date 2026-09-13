import 'server-only';
import { db } from '@/lib/db';

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
  });
}

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({ where: { slug, published: true } });
}
