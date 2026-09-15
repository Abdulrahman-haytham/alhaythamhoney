import 'server-only';
import { db } from '@/lib/db';
import { computePrice, describeRecipe } from '@/lib/mixturePricing';
import { getHoneyOptions } from '@/lib/mixtures.server';
import { isAvailable } from '@/lib/settings';

/** ما يرسله المتصفح: معرّف البند في السلة وكميته فقط — السعر يُحسب هنا. */
export interface CartLineInput {
  id: string;
  quantity: number;
}

export interface ResolvedLine {
  cartId: string;
  productId: string | null;
  name: string;
  unitPrice: number;
  quantity: number;
  weight: string | null;
  image: string | null;
  recipe: string | null;
}

const MIX_PREFIX = 'mix:';

/**
 * يعيد تسعير خلطة من معرّفها في السلة `mix:<slug>:<size>:<honeySlug>:<g1-g2-…>`
 * بنفس دالة التسعير التي يستخدمها بنّاء الخلطة — فلا يمكن للمتصفح اختلاق سعر.
 */
async function resolveMixture(cartId: string): Promise<Omit<ResolvedLine, 'quantity'> | null> {
  const parts = cartId.slice(MIX_PREFIX.length).split(':');
  if (parts.length !== 4) return null;
  const [slug, sizeRaw, honeySlug, gramsRaw] = parts;
  const size = Number(sizeRaw);
  if (!Number.isInteger(size)) return null;
  const [mixture, honeys] = await Promise.all([
    db.mixture.findFirst({
      where: { slug, published: true },
      include: { ingredients: { orderBy: { sortOrder: 'asc' } } },
    }),
    getHoneyOptions(),
  ]);
  const honey = honeys.find((h) => h.slug === honeySlug);
  if (!mixture || !honey || !mixture.sizes.includes(size)) return null;
  const gramsList = gramsRaw.split('-').map(Number);
  if (gramsList.length !== mixture.ingredients.length) return null;
  const grams = Object.fromEntries(mixture.ingredients.map((i, idx) => [i.id, gramsList[idx]]));
  const price = computePrice({
    size,
    honey,
    specs: mixture.ingredients,
    grams,
    prepFee: mixture.prepFee,
  });
  if (!price.valid) return null;
  return {
    cartId,
    productId: null,
    name: `خلطة ${mixture.name}`,
    unitPrice: price.total,
    weight: `${size} غرام`,
    image: honey.image,
    recipe: describeRecipe({ size, honeyName: honey.name, ingredients: price.ingredients }),
  };
}

/**
 * يحوّل بنود السلة إلى أسطر مسعّرة من قاعدة البيانات. البنود التي لم تعد متاحة
 * (حُذفت، أُخفيت، نفدت) تُسقَط وتُعاد أسماؤها ليخبر المتصفح الزبون.
 */
export async function resolveCartLines(items: CartLineInput[]) {
  const productIds = items.filter((i) => !i.id.startsWith(MIX_PREFIX)).map((i) => i.id);
  const products = productIds.length
    ? await db.product.findMany({ where: { id: { in: productIds }, published: true } })
    : [];
  const lines: ResolvedLine[] = [];
  const dropped: { cartId: string; name: string }[] = [];
  for (const item of items) {
    if (item.id.startsWith(MIX_PREFIX)) {
      const mix = await resolveMixture(item.id);
      if (mix) lines.push({ ...mix, quantity: item.quantity });
      else dropped.push({ cartId: item.id, name: 'خلطة مخصّصة' });
      continue;
    }
    const product = products.find((p) => p.id === item.id);
    if (!product || product.price == null || !isAvailable(product)) {
      dropped.push({ cartId: item.id, name: product?.name ?? 'منتج' });
      continue;
    }
    lines.push({
      cartId: item.id,
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity: item.quantity,
      weight: product.weight,
      image: product.image,
      recipe: null,
    });
  }
  return { lines, dropped };
}
