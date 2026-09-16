import 'server-only';
import { db } from '@/lib/db';
import type { CommerceTx } from '@/lib/commerce.server';
import type { PromotionRule } from '@/lib/pricing';

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
