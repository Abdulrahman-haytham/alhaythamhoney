import 'server-only';
import type { z } from 'zod';
import { db } from '@/lib/db';
import type { couponInput } from '@/lib/validation';
import { applyCoupon, type CouponResult } from '@/lib/coupons';

const day = (d: string | null) => (d ? new Date(`${d}T00:00:00Z`) : null);
/** تاريخ الانتهاء يشمل يومه كاملاً */
const endOfDay = (d: string | null) => (d ? new Date(`${d}T23:59:59.999Z`) : null);

export function toCouponData(input: z.infer<typeof couponInput>) {
  return { ...input, startsAt: day(input.startsAt), expiresAt: endOfDay(input.expiresAt) };
}

export async function checkCoupon(
  code: string,
  subtotal: number,
  customerId: string | null,
): Promise<CouponResult> {
  const coupon = await db.coupon.findUnique({ where: { code } });
  const alreadyRedeemed =
    coupon && customerId
      ? (await db.couponRedemption.count({ where: { couponId: coupon.id, customerId } })) > 0
      : false;
  return applyCoupon(coupon, subtotal, new Date(), {
    loggedIn: !!customerId,
    alreadyRedeemed,
    customerId,
  });
}

/** يسجّل استخدام الكوبون لحساب لحظة إرسال الطلب إلى واتساب (لـ«مرة لكل حساب»). */
export async function redeemCoupon(code: string, subtotal: number, customerId: string) {
  const result = await checkCoupon(code, subtotal, customerId);
  if (!result.ok) return result;
  const coupon = await db.coupon.findUnique({ where: { code }, select: { id: true } });
  if (coupon)
    await db.couponRedemption.create({ data: { couponId: coupon.id, customerId, subtotal } });
  return result;
}
