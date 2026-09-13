import { NextResponse } from 'next/server';
import { checkOrigin, readJson } from '@/lib/request-security';
import { rateLimit } from '@/lib/rate-limit';
import { couponCheckInput } from '@/lib/validation';
import { checkCoupon, redeemCoupon } from '@/lib/coupons.server';
import { currentCustomer } from '@/lib/customer-auth';
import { getSettings } from '@/lib/settings.server';

/** تحقق عام من كوبون — محدود المعدل حتى لا تُخمَّن الأكواد بالقوة. */
export async function POST(request: Request) {
  const denied = checkOrigin(request) || (await rateLimit(request, 'coupon-check', 30, 600));
  if (denied) return denied;
  const settings = await getSettings();
  if (!settings.couponsEnabled)
    return NextResponse.json({ ok: false, reason: 'الكوبونات غير مفعّلة حالياً.' });
  const parsed = couponCheckInput.safeParse(await readJson(request));
  if (!parsed.success) return NextResponse.json({ ok: false, reason: 'كود غير صالح.' });
  const customer = await currentCustomer();
  return NextResponse.json(
    await checkCoupon(parsed.data.code, parsed.data.subtotal, customer?.id ?? null),
  );
}

/** تسجيل الاستخدام عند إتمام الطلب — من حساب مسجّل فقط. */
export async function PUT(request: Request) {
  const denied = checkOrigin(request) || (await rateLimit(request, 'coupon-redeem', 20, 3600));
  if (denied) return denied;
  const customer = await currentCustomer();
  if (!customer) return NextResponse.json({ ok: false, reason: 'سجّل الدخول.' }, { status: 401 });
  const parsed = couponCheckInput.safeParse(await readJson(request));
  if (!parsed.success) return NextResponse.json({ ok: false, reason: 'كود غير صالح.' });
  return NextResponse.json(await redeemCoupon(parsed.data.code, parsed.data.subtotal, customer.id));
}
