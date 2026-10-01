import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkOrigin, readJson } from '@/lib/request-security';
import { rateLimit } from '@/lib/rate-limit';
import { registerInput } from '@/lib/validation';
import { customerCookie } from '@/lib/customer-auth';
import { readVerifiedLoginToken } from '@/lib/session';
import { grantWelcomeCoupon } from '@/lib/loyalty.server';
import { getSettings } from '@/lib/settings.server';
import { formatPhone } from '@/lib/phone';

/** إنشاء الحساب بعد التحقق من واتساب — الاسم والمدينة فقط؛ رقم واتساب هو هاتف التوصيل. */
export async function POST(request: Request) {
  const denied = checkOrigin(request) || (await rateLimit(request, 'register', 10, 3600));
  if (denied) return denied;
  const parsed = registerInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الاسم.' },
      { status: 400 },
    );
  const { token, ref, ...profile } = parsed.data;
  const whatsapp = readVerifiedLoginToken(token);
  if (!whatsapp)
    return NextResponse.json({ error: 'انتهت مهلة التحقق — أعد إرسال الرمز.' }, { status: 400 });
  const settings = await getSettings();
  // رمز الإحالة يُقبل عند إنشاء الحساب فقط، ولا يحيل المرء نفسه
  const referrer =
    ref && settings.referralEnabled
      ? await db.customer.findUnique({
          where: { referralCode: ref },
          select: { id: true, whatsapp: true },
        })
      : null;
  const existing = await db.customer.findUnique({ where: { whatsapp }, select: { id: true } });
  const customer = await db.customer.upsert({
    where: { whatsapp },
    create: {
      whatsapp,
      phone: formatPhone(whatsapp).replace(/\s/g, ''),
      ...profile,
      lastLoginAt: new Date(),
      referredById: referrer && referrer.whatsapp !== whatsapp ? referrer.id : null,
    },
    update: { lastLoginAt: new Date() },
    select: { id: true },
  });
  if (!existing) await grantWelcomeCoupon(customer.id, null).catch(() => null);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(customerCookie(customer.id));
  return res;
}
