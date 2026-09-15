/**
 * محرّك تسعير السلة — منطق خالص (بلا قاعدة بيانات) حتى يُختبر بدقة
 * ويعطي النتيجة نفسها في API التسعير وفي إنشاء الطلب.
 */
import type { CouponResult } from '@/lib/coupons';

export interface PricingLine {
  cartId: string;
  productId: string | null;
  name: string;
  unitPrice: number;
  quantity: number;
  weight: string | null;
  image: string | null;
  recipe: string | null;
}

export interface QuoteLine extends PricingLine {
  /** إجمالي السطر بعد خصم الكمية إن وُجد */
  lineTotal: number;
  lineDiscount: number;
  lineDiscountLabel: string | null;
}

export type AdjustmentKind = 'tier' | 'promotion' | 'coupon' | 'points';

export interface QuoteAdjustment {
  kind: AdjustmentKind;
  label: string;
  amount: number;
}

export interface Quote {
  lines: QuoteLine[];
  adjustments: QuoteAdjustment[];
  /** رسائل تحفيز: «أضف X لتحصل على…» */
  hints: string[];
  subtotal: number;
  discount: number;
  shipping: number;
  freeShipping: boolean;
  shippingLabel: string | null;
  total: number;
  coupon: CouponResult | null;
  /** بنود سقطت من السلة لأنها لم تعد متاحة */
  dropped: DroppedLine[];
}

export interface DroppedLine {
  cartId: string;
  name: string;
}

export interface QuoteOptions {
  lines: PricingLine[];
  coupon: CouponResult | null;
  shippingCost: number;
  /** 0 = لا توصيل مجاني */
  freeShippingThreshold: number;
  shippingLabel?: string | null;
  dropped?: DroppedLine[];
}

export const fmtSyp = (n: number) => new Intl.NumberFormat('en-US').format(n);

export function buildQuote(opts: QuoteOptions): Quote {
  const lines: QuoteLine[] = opts.lines.map((l) => ({
    ...l,
    lineTotal: l.unitPrice * l.quantity,
    lineDiscount: 0,
    lineDiscountLabel: null,
  }));
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const adjustments: QuoteAdjustment[] = [];
  const hints: string[] = [];

  if (opts.coupon?.ok && opts.coupon.discount > 0) {
    adjustments.push({
      kind: 'coupon',
      label: `كوبون ${opts.coupon.code} (${opts.coupon.label})`,
      amount: opts.coupon.discount,
    });
  }

  const discount = Math.min(
    subtotal,
    adjustments.reduce((s, a) => s + a.amount, 0),
  );
  const afterDiscount = subtotal - discount;
  const freeShipping =
    opts.freeShippingThreshold > 0 && afterDiscount >= opts.freeShippingThreshold;
  if (opts.freeShippingThreshold > 0 && !freeShipping)
    hints.push(
      `أضف ${fmtSyp(opts.freeShippingThreshold - afterDiscount)} ل.س ليصبح التوصيل مجانياً`,
    );
  const shipping = lines.length === 0 || freeShipping ? 0 : opts.shippingCost;

  return {
    lines,
    adjustments,
    hints,
    subtotal,
    discount,
    shipping,
    freeShipping,
    shippingLabel: opts.shippingLabel ?? null,
    total: afterDiscount + shipping,
    coupon: opts.coupon,
    dropped: opts.dropped ?? [],
  };
}

/** نص رسالة واتساب من عرض السعر — يُبنى من الخادم ليتطابق مع ما سُجّل في الطلب. */
export function whatsappOrderMessage(quote: Quote, reference: string, trackUrl: string) {
  return [
    `مرحباً عسل الهيثم، أود تأكيد الطلب رقم ${reference}:`,
    '',
    ...quote.lines.map((l) => {
      const line = `• ${l.name} × ${l.quantity}${l.weight ? ` (${l.weight})` : ''} — ${fmtSyp(l.lineTotal)} ل.س`;
      return l.recipe ? `${line}\n   الوصفة: ${l.recipe}` : line;
    }),
    '',
    `المجموع: ${fmtSyp(quote.subtotal)} ل.س`,
    ...quote.adjustments.map((a) => `${a.label}: -${fmtSyp(a.amount)} ل.س`),
    `الشحن${quote.shippingLabel ? ` (${quote.shippingLabel})` : ''}: ${quote.freeShipping ? 'مجاني' : `${fmtSyp(quote.shipping)} ل.س`}`,
    `الإجمالي: ${fmtSyp(quote.total)} ل.س`,
    '',
    `متابعة الطلب: ${trackUrl}`,
    'هذه الأسعار من السلة المحفوظة. أرجو تأكيد السعر النهائي والشحن والتوفر ومدة التوصيل.',
  ].join('\n');
}
