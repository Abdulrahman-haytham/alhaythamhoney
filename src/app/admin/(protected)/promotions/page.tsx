import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings.server';
import { monthStart } from '@/lib/promotions.server';
import { toIsoDay } from '@/lib/articles';
import { PromotionsPanel } from './PromotionsPanel';

export const dynamic = 'force-dynamic';

export default async function AdminPromotionsPage() {
  const [promotions, products, usage, settings] = await Promise.all([
    db.promotion.findMany({ orderBy: { createdAt: 'desc' } }),
    db.product.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, price: true },
    }),
    db.promotionUse.groupBy({
      by: ['promotionId'],
      where: { createdAt: { gte: monthStart() } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    getSettings(),
  ]);
  return (
    <>
      <h1 className="mb-3 font-amiri text-3xl font-bold">العروض التلقائية</h1>
      <p className="mb-6 text-sm text-zinc-400">
        عروض بلا كود تُطبَّق في السلة حين تتحقق شروطها، ويرى الزبون «أضف X لتحصل على…» قبل ذلك.
        الميزانية الشهرية تحمي رصيدك: حين تبلغ قيمة الخصومات والهدايا السقف يتوقف العرض حتى الشهر
        التالي.
        {!settings.promotionsEnabled && (
          <b className="block text-red-300">العروض معطّلة من الإعدادات — لن يُطبَّق أي منها.</b>
        )}
      </p>
      <PromotionsPanel
        products={products}
        promotions={promotions.map((p) => ({
          id: p.id,
          title: p.title,
          kind: p.kind,
          active: p.active,
          startsAt: p.startsAt ? toIsoDay(p.startsAt) : null,
          endsAt: p.endsAt ? toIsoDay(p.endsAt) : null,
          minSubtotal: p.minSubtotal,
          percent: p.percent,
          maxDiscount: p.maxDiscount,
          buyProductId: p.buyProductId,
          buyQty: p.buyQty,
          giftProductId: p.giftProductId,
          giftQty: p.giftQty,
          showProgress: p.showProgress,
          monthlyBudget: p.monthlyBudget,
          usedThisMonth: usage.find((u) => u.promotionId === p.id)?._sum.amount ?? 0,
          usesThisMonth: usage.find((u) => u.promotionId === p.id)?._count._all ?? 0,
        }))}
      />
    </>
  );
}
