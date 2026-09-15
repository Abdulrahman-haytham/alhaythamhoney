import 'server-only';
import { createHash } from 'node:crypto';
import { commerceTransaction, CommerceError, type CommerceTx } from '@/lib/commerce.server';
import { db } from '@/lib/db';
import { resolveCartLines, type CartLineInput } from '@/lib/cart.server';
import { checkCoupon } from '@/lib/coupons.server';
import { getCommerceSettings } from '@/lib/settings.server';
import { getActivePromotionRules } from '@/lib/promotions.server';
import { buildQuote, type Quote, type QuoteZone } from '@/lib/pricing';
import { addPoints, customerRedeemable } from '@/lib/loyalty.server';
import type { CustomerInfo } from '@/lib/customer-auth';

export interface QuoteRequest {
  items: CartLineInput[];
  couponCode: string | null;
  zoneId?: string | null;
  usePoints?: boolean;
}

async function getZones(tx: CommerceTx): Promise<QuoteZone[]> {
  const zones = await tx.shippingZone.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, cost: true, etaText: true },
  });
  return zones;
}

/** عرض سعر كامل للسلة من قاعدة البيانات — المصدر الوحيد للحقيقة قبل الطلب. */
export async function quoteCart(
  req: QuoteRequest,
  customer: CustomerInfo | null,
  tx: CommerceTx = db,
): Promise<Quote> {
  const settings = await getCommerceSettings(tx);
  const [{ lines, dropped }, promotions, zones] = await Promise.all([
    resolveCartLines(req.items, settings.tieredPricingEnabled, tx),
    settings.promotionsEnabled ? getActivePromotionRules(new Date(), tx) : Promise.resolve([]),
    settings.shippingZonesEnabled ? getZones(tx) : Promise.resolve([]),
  ]);
  // المنطقة: المختارة، وإلا محافظة الزبون من حسابه إن طابقت اسماً
  const zone =
    zones.find((z) => z.id === req.zoneId) ??
    (customer?.city ? zones.find((z) => z.name === customer.city) : undefined) ??
    null;
  const shippingCost = zone ? zone.cost : settings.shippingCost;
  const shippingLabel = zone ? `${zone.name}${zone.etaText ? ` · ${zone.etaText}` : ''}` : null;
  const base = { lines, dropped, promotions, zones, zoneId: zone?.id ?? null };
  // الكوبون يُحسب على المبلغ بعد خصومات الكمية والعروض، فنمرّ بالمحرّك مرتين
  const pre = buildQuote({
    ...base,
    coupon: null,
    shippingCost,
    freeShippingThreshold: settings.freeShippingThreshold,
    shippingLabel,
  });
  const coupon =
    settings.couponsEnabled && req.couponCode && lines.length
      ? await checkCoupon(req.couponCode, pre.subtotal - pre.discount, customer?.id ?? null, tx)
      : null;
  // النقاط تُستبدل على ما بقي بعد كل الخصومات الأخرى
  let loyalty: Quote['loyalty'] = null;
  let points: { amount: number; label: string } | null = null;
  if (customer && settings.loyaltyEnabled && lines.length) {
    const afterCoupon = pre.subtotal - pre.discount - (coupon?.ok ? coupon.discount : 0);
    const r = await customerRedeemable(customer.id, Math.max(0, afterCoupon), tx, settings);
    const use = req.usePoints && r.points > 0;
    loyalty = {
      balance: r.balance,
      pointValue: settings.pointValue,
      redeemablePoints: r.points,
      redeemableAmount: r.amount,
      pointsUsed: use ? r.points : 0,
      blocked: r.blocked,
    };
    if (use) points = { amount: r.amount, label: `استبدال ${r.points} نقطة` };
  }
  return buildQuote({
    ...base,
    coupon,
    shippingCost,
    freeShippingThreshold: settings.freeShippingThreshold,
    shippingLabel,
    points,
    loyalty,
  });
}

/**
 * يسجّل الطلب بحالة «بانتظار التأكيد» بالأسعار المحسوبة هنا لا في المتصفح،
 * ويسجّل استخدام الكوبون للحسابات (مرة لكل حساب) واستخدام العروض مقابل ميزانيتها.
 */
export async function createOrder(
  req: QuoteRequest & { reference: string; expectedTotal?: number },
  customer: CustomerInfo | null,
) {
  const requestHash = createHash('sha256')
    .update(
      JSON.stringify({
        customerId: customer?.id ?? null,
        items: [...req.items].sort((a, b) => a.id.localeCompare(b.id)),
        couponCode: req.couponCode,
        zoneId: req.zoneId ?? null,
        usePoints: req.usePoints ?? false,
        expectedTotal: req.expectedTotal ?? null,
      }),
    )
    .digest('hex');
  return commerceTransaction(async (tx) => {
    const existing = await tx.order.findUnique({ where: { reference: req.reference } });
    if (existing) {
      if (existing.requestHash !== requestHash || !existing.quoteSnapshot)
        throw new CommerceError('مرجع مستخدم لمحاولة مختلفة. حدّث السلة وأعد المحاولة.');
      return { quote: existing.quoteSnapshot as unknown as Quote, order: existing, replayed: true };
    }
    const quote = await quoteCart(req, customer, tx);
    // A changed/removed line or a different total must be reviewed before reserving benefits.
    if (
      !quote.lines.length ||
      quote.dropped.length ||
      (req.expectedTotal !== undefined && quote.total !== req.expectedTotal)
    )
      return { quote, order: null, replayed: false };
    const zone = quote.zones.find((z) => z.id === quote.zoneId) ?? null;
    const created = await tx.order.create({
      data: {
        reference: req.reference,
        requestHash,
        quoteSnapshot: JSON.parse(JSON.stringify(quote)),
        pointsDiscount: quote.loyalty?.pointsUsed ? quote.loyalty.redeemableAmount : 0,
        customerId: customer?.id ?? null,
        customerName: customer?.name ?? null,
        customerPhone: customer?.phone ?? null,
        customerCity: zone?.name ?? customer?.city ?? null,
        zoneName: zone?.name ?? null,
        pointsUsed: quote.loyalty?.pointsUsed ?? 0,
        subtotal: quote.subtotal,
        discount: quote.discount,
        shipping: quote.shipping,
        total: quote.total,
        couponCode: quote.coupon?.ok ? quote.coupon.code : null,
        breakdown: JSON.parse(
          JSON.stringify({
            adjustments: quote.adjustments,
            gifts: quote.gifts,
            shippingLabel: quote.shippingLabel,
            freeShipping: quote.freeShipping,
          }),
        ),
        items: {
          create: [
            ...quote.lines.map((l) => ({
              productId: l.productId,
              variantId: l.variantId ?? null,
              cartId: l.cartId,
              name: l.name,
              price: l.unitPrice,
              quantity: l.quantity,
              weight: l.weight,
              image: l.image,
              recipe: l.recipe,
            })),
            ...quote.gifts.map((g) => ({
              productId: g.productId,
              cartId: `gift:${g.promotionId}`,
              name: `هدية: ${g.name}`,
              price: 0,
              quantity: g.quantity,
              weight: null,
              image: g.image,
              recipe: null,
            })),
          ],
        },
        promotionUses: {
          create: quote.promotionsApplied.map((p) => ({ promotionId: p.id, amount: p.amount })),
        },
      },
      select: { id: true, reference: true },
    });
    if (quote.loyalty && quote.loyalty.pointsUsed > 0 && customer) {
      await addPoints(tx, customer.id, -quote.loyalty.pointsUsed, 'ORDER_REDEEM', {
        orderId: created.id,
        note: req.reference,
        eventKey: `order:${created.id}:redeem`,
      });
    }
    if (quote.coupon?.ok && customer) {
      const coupon = await tx.coupon.findUnique({
        where: { code: quote.coupon.code },
        select: { id: true },
      });
      if (coupon)
        await tx.couponRedemption.create({
          data: {
            couponId: coupon.id,
            customerId: customer.id,
            subtotal: quote.subtotal,
            orderId: created.id,
          },
        });
    }
    return { quote, order: created, replayed: false };
  });
}
