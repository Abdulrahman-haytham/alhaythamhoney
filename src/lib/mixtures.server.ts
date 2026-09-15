import 'server-only';
import { db } from '@/lib/db';
import type { CommerceTx } from '@/lib/commerce.server';
import { computePrice, parseGrams, type HoneyOption } from '@/lib/mixturePricing';
import type { MixtureCardData } from '@/components/MixtureCard';

export async function getMixtures() {
  return db.mixture.findMany({
    where: { published: true },
    orderBy: { sortOrder: 'asc' },
    include: { ingredients: { orderBy: { sortOrder: 'asc' } } },
  });
}

/**
 * بطاقات الخلطات للعرض بجانب المنتجات.
 * «تبدأ من» = أصغر حجم + أرخص عسل + الحد الأدنى لكل مكوّن — أقل سعر ممكن فعلاً،
 * يُحسب بنفس دالة التسعير حتى لا يختلف عمّا يراه الزبون في بنّاء الخلطة.
 */
export async function getMixtureCards(): Promise<MixtureCardData[]> {
  const [mixtures, honeys] = await Promise.all([getMixtures(), getHoneyOptions()]);
  const cheapest = honeys.reduce<HoneyOption | null>(
    (min, h) => (min === null || h.pricePerGram < min.pricePerGram ? h : min),
    null,
  );

  return mixtures.map((m) => {
    const size = Math.min(...m.sizes);
    const fromPrice =
      cheapest === null
        ? null
        : computePrice({
            size,
            honey: cheapest,
            specs: m.ingredients,
            grams: Object.fromEntries(m.ingredients.map((i) => [i.id, i.minGrams])),
            prepFee: m.prepFee,
          }).total;

    return {
      id: m.id,
      slug: m.slug,
      name: m.name,
      tagline: m.tagline,
      desc: m.desc,
      image: m.image,
      ingredientNames: m.ingredients.map((i) => i.name),
      fromPrice,
    };
  });
}

export async function getMixtureBySlug(slug: string) {
  return db.mixture.findUnique({
    where: { slug },
    include: { ingredients: { orderBy: { sortOrder: 'asc' } } },
  });
}

/** أنواع العسل المتاحة كقاعدة للخلطة — من المنتجات المنشورة ذات سعر ووزن صالحين. */
export async function getHoneyOptions(tx: CommerceTx = db): Promise<HoneyOption[]> {
  const rows = await tx.product.findMany({
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
