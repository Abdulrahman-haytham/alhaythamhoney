import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkOrigin, readJson } from '@/lib/request-security';
import { rateLimit } from '@/lib/rate-limit';
import { verifyCodeInput } from '@/lib/validation';
import { consumeLoginCode, customerCookie } from '@/lib/customer-auth';
import { createVerifiedEmailToken } from '@/lib/session';

/** يتحقق من الرمز: حساب موجود → جلسة؛ بريد جديد → رمز مؤقت لإكمال الملف. */
export async function POST(request: Request) {
  const denied = checkOrigin(request) || (await rateLimit(request, 'login-verify', 20, 900));
  if (denied) return denied;
  const parsed = verifyCodeInput.safeParse(await readJson(request));
  if (!parsed.success) return NextResponse.json({ error: 'الرمز 6 أرقام.' }, { status: 400 });
  const { email, code } = parsed.data;
  if (!(await consumeLoginCode(email, code)))
    return NextResponse.json({ error: 'الرمز غير صحيح أو انتهت صلاحيته.' }, { status: 400 });
  const customer = await db.customer.findUnique({ where: { email }, select: { id: true } });
  if (!customer)
    return NextResponse.json({
      ok: true,
      needsProfile: true,
      token: createVerifiedEmailToken(email),
    });
  await db.customer.update({ where: { id: customer.id }, data: { lastLoginAt: new Date() } });
  const res = NextResponse.json({ ok: true, needsProfile: false });
  res.cookies.set(customerCookie(customer.id));
  return res;
}
