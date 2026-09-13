import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkOrigin, readJson } from '@/lib/request-security';
import { rateLimit } from '@/lib/rate-limit';
import { registerInput } from '@/lib/validation';
import { customerCookie } from '@/lib/customer-auth';
import { readVerifiedEmailToken } from '@/lib/session';

/** إنشاء الحساب بعد التحقق من البريد — الاسم والهاتف فقط، بلا كلمة مرور. */
export async function POST(request: Request) {
  const denied = checkOrigin(request) || (await rateLimit(request, 'register', 10, 3600));
  if (denied) return denied;
  const parsed = registerInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الاسم ورقم الهاتف.' },
      { status: 400 },
    );
  const { token, ...profile } = parsed.data;
  const email = readVerifiedEmailToken(token);
  if (!email)
    return NextResponse.json({ error: 'انتهت مهلة التحقق — أعد إرسال الرمز.' }, { status: 400 });
  const customer = await db.customer.upsert({
    where: { email },
    create: { email, ...profile, lastLoginAt: new Date() },
    update: { lastLoginAt: new Date() },
    select: { id: true },
  });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(customerCookie(customer.id));
  return res;
}
