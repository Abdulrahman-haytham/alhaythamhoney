import 'server-only';
import { db } from '@/lib/db';
import { parseGrams, type HoneyOption } from '@/lib/mixturePricing';

export async function getMixtures() {
  return db.mixture.findMany({
    where: { published: true },
    orderBy: { sortOrder: 'asc' },
    include: { ingredients: { orderBy: { sortOrder: 'asc' } } },
  });
}

export async function getMixtureBySlug(slug: string) {
  return db.mixture.findUnique({
    where: { slug },
    include: { ingredients: { orderBy: { sortOrder: 'asc' } } },
  });
}

/** أنواع العسل المتاحة كقاعدة للخلطة — من المنتجات المنشورة ذات سعر ووزن صالحين. */
export async function getHoneyOptions(): Promise<HoneyOption[]> {
  const rows = await db.product.findMany({
    where: { category: 'HONEY', published: true, inStock: true },
    orderBy: { sortOrder: 'asc' },
    select: { slug: true, name: true, image: true, price: true, weight: true },
  });
  return rows.flatMap((p) => {
    const grams = parseGrams(p.weight);
    if (!p.price || !grams) return [];
    return [
      { slug: p.slug, name: p.name, image: p.image, pricePerGram: Math.round(p.price / grams) },
    ];
  });
}
