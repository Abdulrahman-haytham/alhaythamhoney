import 'server-only';
import { db } from '@/lib/db';
import { resolveCartLines, type CartLineInput } from '@/lib/cart.server';
import { checkCoupon } from '@/lib/coupons.server';
import { getSettings } from '@/lib/settings.server';
import { buildQuote, type Quote } from '@/lib/pricing';
import type { CustomerInfo } from '@/lib/customer-auth';

export interface QuoteRequest {
  items: CartLineInput[];
  couponCode: string | null;
}

/** عرض سعر كامل للسلة من قاعدة البيانات — المصدر الوحيد للحقيقة قبل الطلب. */
export async function quoteCart(req: QuoteRequest, customer: CustomerInfo | null): Promise<Quote> {
  const settings = await getSettings();
  const { lines, dropped } = await resolveCartLines(req.items);
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const coupon =
    settings.couponsEnabled && req.couponCode && lines.length
      ? await checkCoupon(req.couponCode, subtotal, customer?.id ?? null)
      : null;
  return buildQuote({
    lines,
    coupon,
    shippingCost: settings.shippingCost,
    freeShippingThreshold: settings.freeShippingThreshold,
    dropped,
  });
}

/**
 * يسجّل الطلب بحالة «بانتظار التأكيد» بالأسعار المحسوبة هنا لا في المتصفح،
 * ويسجّل استخدام الكوبون للحسابات (مرة لكل حساب).
 */
export async function createOrder(
  req: QuoteRequest & { reference: string },
  customer: CustomerInfo | null,
) {
  const quote = await quoteCart(req, customer);
  if (quote.lines.length === 0) return { quote, order: null };
  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        reference: req.reference,
        customerId: customer?.id ?? null,
        customerName: customer?.name ?? null,
        customerPhone: customer?.phone ?? null,
        customerCity: customer?.city ?? null,
        subtotal: quote.subtotal,
        discount: quote.discount,
        shipping: quote.shipping,
        total: quote.total,
        couponCode: quote.coupon?.ok ? quote.coupon.code : null,
        breakdown: JSON.parse(
          JSON.stringify({
            adjustments: quote.adjustments,
            shippingLabel: quote.shippingLabel,
            freeShipping: quote.freeShipping,
          }),
        ),
        items: {
          create: quote.lines.map((l) => ({
            productId: l.productId,
            cartId: l.cartId,
            name: l.name,
            price: l.unitPrice,
            quantity: l.quantity,
            weight: l.weight,
            image: l.image,
            recipe: l.recipe,
          })),
        },
      },
      select: { id: true, reference: true },
    });
    if (quote.coupon?.ok && customer) {
      const coupon = await tx.coupon.findUnique({
        where: { code: quote.coupon.code },
        select: { id: true },
      });
      if (coupon)
        await tx.couponRedemption.create({
          data: { couponId: coupon.id, customerId: customer.id, subtotal: quote.subtotal },
        });
    }
    return created;
  });
  return { quote, order };
}
