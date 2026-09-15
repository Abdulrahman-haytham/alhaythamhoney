/**
 * محرّك تسعير السلة — منطق خالص (بلا قاعدة بيانات) حتى يُختبر بدقة
 * ويعطي النتيجة نفسها في API التسعير وفي إنشاء الطلب.
 *
 * ترتيب التطبيق: خصم الكمية على كل سطر → العروض التلقائية → الكوبون → النقاط → الشحن.
 */
import type { CouponResult } from '@/lib/coupons';

export interface PriceTierRule {
  minQty: number;
  discountPercent: number;
}

export interface PricingLine {
  cartId: string;
  productId: string | null;
  variantId?: string | null;
  name: string;
  unitPrice: number;
  quantity: number;
  weight: string | null;
  image: string | null;
  recipe: string | null;
  /** شرائح خصم الكمية للمنتج (إن فُعّلت) */
  tiers?: PriceTierRule[];
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

export interface QuoteGift {
  promotionId: string;
  productId: string;
  name: string;
  image: string | null;
  quantity: number;
  /** قيمة الهدية بالليرة — للميزانية والعرض «بقيمة X» */
  value: number;
  label: string;
}

export interface QuoteZone {
  id: string;
  name: string;
  cost: number;
  etaText: string | null;
}

export interface Quote {
  lines: QuoteLine[];
  gifts: QuoteGift[];
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
  /** مناطق الشحن المتاحة (إن فُعّلت) والمختارة منها */
  zones: QuoteZone[];
  zoneId: string | null;
  /** العروض المطبَّقة وقيمتها — لتسجيل الاستخدام مقابل الميزانية */
  promotionsApplied: { id: string; amount: number }[];
}

export interface DroppedLine {
  cartId: string;
  name: string;
}

export type PromotionKind = 'PERCENT_OVER_AMOUNT' | 'GIFT_OVER_AMOUNT' | 'BUY_X_GET_Y';

export interface PromotionRule {
  id: string;
  title: string;
  kind: PromotionKind;
  minSubtotal: number;
  percent: number;
  maxDiscount: number | null;
  buyProductId: string | null;
  buyQty: number;
  giftProductId: string | null;
  giftQty: number;
  showProgress: boolean;
  /** ما تبقّى من ميزانية الشهر بالليرة — null = بلا سقف */
  remainingBudget: number | null;
  buyProduct?: { name: string } | null;
  gift?: { name: string; image: string | null; price: number } | null;
}

export interface QuoteOptions {
  lines: PricingLine[];
  coupon: CouponResult | null;
  shippingCost: number;
  /** 0 = لا توصيل مجاني */
  freeShippingThreshold: number;
  shippingLabel?: string | null;
  dropped?: DroppedLine[];
  promotions?: PromotionRule[];
  zones?: QuoteZone[];
  zoneId?: string | null;
  /** خصم النقاط (محسوب مسبقاً) */
  points?: { amount: number; label: string } | null;
}

export const fmtSyp = (n: number) => new Intl.NumberFormat('en-US').format(n);

/** أفضل شريحة كمية تنطبق على الكمية */
export function bestTier(tiers: PriceTierRule[] | undefined, quantity: number) {
  return (
    (tiers ?? [])
      .filter((t) => quantity >= t.minQty)
      .sort((a, b) => b.discountPercent - a.discountPercent)[0] ?? null
  );
}

export function buildQuote(opts: QuoteOptions): Quote {
  const lines: QuoteLine[] = opts.lines.map((l) => {
    const gross = l.unitPrice * l.quantity;
    const tier = bestTier(l.tiers, l.quantity);
    const lineDiscount = tier ? Math.floor((gross * tier.discountPercent) / 100) : 0;
    return {
      ...l,
      lineTotal: gross - lineDiscount,
      lineDiscount,
      lineDiscountLabel: tier ? `خصم الكمية ${tier.discountPercent}% (${tier.minQty}+)` : null,
    };
  });
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const adjustments: QuoteAdjustment[] = [];
  const hints: string[] = [];
  const gifts: QuoteGift[] = [];
  const promotionsApplied: { id: string; amount: number }[] = [];

  const tierTotal = lines.reduce((s, l) => s + l.lineDiscount, 0);
  if (tierTotal > 0) adjustments.push({ kind: 'tier', label: 'خصم الكمية', amount: tierTotal });
  let base = subtotal - tierTotal;

  for (const promo of opts.promotions ?? []) {
    const budgetOk = (amount: number) =>
      promo.remainingBudget === null || amount <= promo.remainingBudget;
    if (promo.kind === 'PERCENT_OVER_AMOUNT') {
      if (base >= promo.minSubtotal && promo.percent > 0) {
        let amount = Math.floor((base * promo.percent) / 100);
        if (promo.maxDiscount != null) amount = Math.min(amount, promo.maxDiscount);
        if (amount > 0 && budgetOk(amount)) {
          adjustments.push({ kind: 'promotion', label: promo.title, amount });
          promotionsApplied.push({ id: promo.id, amount });
          base -= amount;
        }
      } else if (promo.showProgress && base < promo.minSubtotal && lines.length)
        hints.push(`أضف ${fmtSyp(promo.minSubtotal - base)} ل.س لتحصل على ${promo.title}`);
      continue;
    }
    if (!promo.gift || !promo.giftProductId) continue;
    if (promo.kind === 'GIFT_OVER_AMOUNT') {
      const value = promo.gift.price * promo.giftQty;
      if (base >= promo.minSubtotal) {
        if (budgetOk(value)) {
          gifts.push({
            promotionId: promo.id,
            productId: promo.giftProductId,
            name: promo.gift.name,
            image: promo.gift.image,
            quantity: promo.giftQty,
            value,
            label: promo.title,
          });
          promotionsApplied.push({ id: promo.id, amount: value });
        }
      } else if (promo.showProgress && lines.length)
        hints.push(
          `أضف ${fmtSyp(promo.minSubtotal - base)} ل.س لتحصل على ${promo.gift.name} هديةً`,
        );
      continue;
    }
    if (promo.kind === 'BUY_X_GET_Y' && promo.buyProductId) {
      const bought = lines
        .filter((l) => l.productId === promo.buyProductId)
        .reduce((s, l) => s + l.quantity, 0);
      const times = Math.floor(bought / promo.buyQty);
      if (times > 0) {
        const quantity = times * promo.giftQty;
        const value = promo.gift.price * quantity;
        if (budgetOk(value)) {
          gifts.push({
            promotionId: promo.id,
            productId: promo.giftProductId,
            name: promo.gift.name,
            image: promo.gift.image,
            quantity,
            value,
            label: promo.title,
          });
          promotionsApplied.push({ id: promo.id, amount: value });
        }
      } else if (promo.showProgress && bought > 0)
        hints.push(
          `أضف ${promo.buyQty - bought} من ${promo.buyProduct?.name ?? 'المنتج'} لتحصل على ${promo.giftQty} ${promo.gift.name} مجاناً`,
        );
    }
  }

  if (opts.coupon?.ok && opts.coupon.discount > 0) {
    const amount = Math.min(opts.coupon.discount, base);
    adjustments.push({
      kind: 'coupon',
      label: `كوبون ${opts.coupon.code} (${opts.coupon.label})`,
      amount,
    });
    base -= amount;
  }
  if (opts.points && opts.points.amount > 0) {
    const amount = Math.min(opts.points.amount, base);
    adjustments.push({ kind: 'points', label: opts.points.label, amount });
    base -= amount;
  }

  const discount = subtotal - base;
  const afterDiscount = base;
  const freeShipping =
    opts.freeShippingThreshold > 0 && afterDiscount >= opts.freeShippingThreshold;
  if (opts.freeShippingThreshold > 0 && !freeShipping && lines.length)
    hints.push(
      `أضف ${fmtSyp(opts.freeShippingThreshold - afterDiscount)} ل.س ليصبح التوصيل مجانياً`,
    );
  const shipping = lines.length === 0 || freeShipping ? 0 : opts.shippingCost;

  return {
    lines,
    gifts,
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
    zones: opts.zones ?? [],
    zoneId: opts.zoneId ?? null,
    promotionsApplied,
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
    ...quote.gifts.map((g) => `🎁 ${g.name} × ${g.quantity} — هدية (${g.label})`),
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
