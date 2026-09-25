import { formatPrice } from '@/lib/money';
/** حساب الخصم — مشترك بين API التحقق والاختبارات. */
export interface CouponRule {
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  active: boolean;
  startsAt: Date | null;
  expiresAt: Date | null;
  requiresLogin?: boolean;
  oncePerCustomer?: boolean;
  /** كوبون شخصي: معرّف الحساب الوحيد الذي يقبله */
  customerId?: string | null;
}

export type CouponResult =
  { ok: true; code: string; discount: number; label: string } | { ok: false; reason: string };

export const normalizeCouponCode = (raw: string) =>
  raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');

export const LOGIN_REQUIRED_REASON = 'هذا الكوبون للأعضاء — سجّل الدخول لاستخدامه.';

export function applyCoupon(
  coupon: CouponRule | null,
  subtotal: number,
  now = new Date(),
  context: { loggedIn: boolean; alreadyRedeemed: boolean; customerId?: string | null } = {
    loggedIn: false,
    alreadyRedeemed: false,
  },
): CouponResult {
  if (!coupon || !coupon.active) return { ok: false, reason: 'الكوبون غير صالح.' };
  if ((coupon.requiresLogin || coupon.oncePerCustomer || coupon.customerId) && !context.loggedIn)
    return { ok: false, reason: LOGIN_REQUIRED_REASON };
  if (coupon.customerId && coupon.customerId !== context.customerId)
    return { ok: false, reason: 'هذا الكوبون شخصي لحساب آخر.' };
  if (coupon.oncePerCustomer && context.alreadyRedeemed)
    return { ok: false, reason: 'استخدمت هذا الكوبون من قبل.' };
  if (coupon.startsAt && coupon.startsAt > now)
    return { ok: false, reason: 'الكوبون لم يبدأ بعد.' };
  if (coupon.expiresAt && coupon.expiresAt < now)
    return { ok: false, reason: 'انتهت صلاحية الكوبون.' };
  if (subtotal < coupon.minOrder)
    return {
      ok: false,
      reason: `الحد الأدنى لهذا الكوبون ${formatPrice(coupon.minOrder)}.`,
    };
  let discount =
    coupon.type === 'PERCENT' ? Math.floor((subtotal * coupon.value) / 100) : coupon.value;
  if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.max(0, Math.min(discount, subtotal));
  const label = coupon.type === 'PERCENT' ? `خصم ${coupon.value}%` : 'خصم ثابت';
  return { ok: true, code: coupon.code, discount, label };
}
