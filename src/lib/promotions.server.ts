import 'server-only';
import { db } from '@/lib/db';
import type { CommerceTx } from '@/lib/commerce.server';
import type { PromotionRule } from '@/lib/pricing';
import { CURRENCY, formatAmount } from '@/lib/money';

/** بداية الشهر الحالي (UTC) — نافذة الميزانية الشهرية */
export function monthStart(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/**
 * العروض السارية الآن مع ما تبقّى من ميزانيتها الشهرية ومنتجات الهدايا —
 * جاهزة للمحرّك الخالص buildQuote.
 */
export async function getActivePromotionRules(
  now = new Date(),
  tx: CommerceTx = db,
): Promise<PromotionRule[]> {
  const promotions = await tx.promotion.findMany({
    where: {
      active: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    orderBy: { createdAt: 'asc' },
  });
  if (promotions.length === 0) return [];
  const productIds = [
    ...new Set(
      promotions.flatMap((p) => [p.buyProductId, p.giftProductId]).filter((x): x is string => !!x),
    ),
  ];
  const [products, usage] = await Promise.all([
    productIds.length
      ? tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, image: true, price: true, published: true },
        })
      : [],
    tx.promotionUse.groupBy({
      by: ['promotionId'],
      // الطلب الملغى لا يستهلك ميزانية العرض
      where: { createdAt: { gte: monthStart(now) }, order: { status: { not: 'CANCELLED' } } },
      _sum: { amount: true },
    }),
  ]);
  const used = (id: string) => usage.find((u) => u.promotionId === id)?._sum.amount ?? 0;
  return promotions.map((p) => {
    const gift = products.find((x) => x.id === p.giftProductId);
    const buy = products.find((x) => x.id === p.buyProductId);
    return {
      id: p.id,
      title: p.title,
      kind: p.kind,
      minSubtotal: p.minSubtotal,
      percent: p.percent,
      maxDiscount: p.maxDiscount,
      buyProductId: p.buyProductId,
      buyQty: p.buyQty,
      giftProductId: p.giftProductId,
      giftQty: p.giftQty,
      showProgress: p.showProgress,
      remainingBudget: p.monthlyBudget > 0 ? Math.max(0, p.monthlyBudget - used(p.id)) : null,
      buyProduct: buy ? { name: buy.name } : null,
      gift:
        gift && gift.published && gift.price != null
          ? { name: gift.name, image: gift.image, price: gift.price }
          : null,
    };
  });
}

/** عروض تخصّ منتجاً بعينه — لعرض شارة «اشترِ 2 واحصل على 1» في صفحته. */
export async function getProductPromotionLabels(productId: string) {
  const rules = await getActivePromotionRules();
  return rules
    .filter((r) => r.kind === 'BUY_X_GET_Y' && r.buyProductId === productId && r.gift)
    .map((r) =>
      r.giftProductId === productId
        ? `اشترِ ${r.buyQty} واحصل على ${r.giftQty} مجاناً`
        : `اشترِ ${r.buyQty} واحصل على ${r.giftQty} ${r.gift!.name} مجاناً`,
    );
}

export interface PromotionCard {
  id: string;
  /** الصفقة بكلمات قليلة: «اشترِ 2 واحصل على 1 مجاناً» */
  headline: string;
  title: string;
  /** سطر الشرط إن وُجد: «عند تجاوز 50,000 ل.س» */
  condition: string | null;
  endsAt: string | null;
  image: string | null;
  /** منتج العرض إن كان مرتبطاً بمنتج — زرّه يضيفه إلى السلة بالكمية المطلوبة */
  product: {
    id: string;
    slug: string;
    name: string;
    image: string;
    price: number;
    weight: string | null;
  } | null;
  quantity: number;
}

/**
 * العروض الفعّالة كما يراها الزائر على الرئيسية — المصدر نفسه الذي يطبّق الخصم في السلة،
 * فلا يَعِد القسم بشيء لا تطبّقه السلة. لا عروض ⇒ مصفوفة فارغة ⇒ يختفي القسم.
 */
export async function getPromotionCards(now = new Date()): Promise<PromotionCard[]> {
  const rules = await getActivePromotionRules(now);
  if (rules.length === 0) return [];
  const rows = await db.promotion.findMany({
    where: { id: { in: rules.map((r) => r.id) } },
    select: { id: true, endsAt: true },
  });
  const buyIds = rules.map((r) => r.buyProductId).filter((x): x is string => !!x);
  const products = buyIds.length
    ? await db.product.findMany({
        where: { id: { in: buyIds }, published: true, inStock: true, price: { not: null } },
        select: { id: true, slug: true, name: true, image: true, price: true, weight: true },
      })
    : [];
  const amount = (n: number) => `${formatAmount(n)} ${CURRENCY.label}`;

  return rules.flatMap((r): PromotionCard[] => {
    // الميزانية الشهرية نفدت: السلة لن تطبّقه، فلا يُعلن عنه
    if (r.remainingBudget === 0) return [];
    const endsAt = rows.find((x) => x.id === r.id)?.endsAt?.toISOString() ?? null;
    const over = r.minSubtotal > 0 ? `عند تجاوز ${amount(r.minSubtotal)}` : null;
    if (r.kind === 'PERCENT_OVER_AMOUNT') {
      return [
        {
          id: r.id,
          title: r.title,
          headline: `خصم ${r.percent}%`,
          condition: over ?? 'على كل الطلبات',
          endsAt,
          image: null,
          product: null,
          quantity: 1,
        },
      ];
    }
    if (r.kind === 'GIFT_OVER_AMOUNT') {
      if (!r.gift) return [];
      return [
        {
          id: r.id,
          title: r.title,
          headline: `${r.gift.name} هدية`,
          condition: over,
          endsAt,
          image: r.gift.image,
          product: null,
          quantity: 1,
        },
      ];
    }
    const buy = products.find((p) => p.id === r.buyProductId);
    if (!buy || !r.gift) return [];
    return [
      {
        id: r.id,
        title: r.title,
        headline:
          r.giftProductId === r.buyProductId
            ? `اشترِ ${r.buyQty} واحصل على ${r.giftQty} مجاناً`
            : `اشترِ ${r.buyQty} واحصل على ${r.gift.name} مجاناً`,
        condition: buy.name,
        endsAt,
        image: buy.image,
        product: { ...buy, price: buy.price! },
        quantity: r.buyQty,
      },
    ];
  });
}
