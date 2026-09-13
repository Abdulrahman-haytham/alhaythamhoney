import { NextResponse } from 'next/server';
import { checkOrigin, readJson } from '@/lib/request-security';
import { rateLimit } from '@/lib/rate-limit';
import { requestCodeInput } from '@/lib/validation';
import { issueLoginCode } from '@/lib/customer-auth';
import { sendMail, loginCodeMail } from '@/lib/mail';

export const runtime = 'nodejs';

/** يرسل رمز دخول إلى البريد. الرد واحد سواء كان البريد مسجّلاً أم لا (لا نكشف الحسابات). */
export async function POST(request: Request) {
  const denied = checkOrigin(request) || (await rateLimit(request, 'login-code-ip', 10, 900));
  if (denied) return denied;
  const parsed = requestCodeInput.safeParse(await readJson(request));
  if (!parsed.success) return NextResponse.json({ error: 'بريد غير صالح.' }, { status: 400 });
  const { email } = parsed.data;
  const perEmail = await rateLimit(request, 'login-code-email', 5, 900, email);
  if (perEmail) return perEmail;
  const code = await issueLoginCode(email);
  const mail = loginCodeMail(code);
  try {
    await sendMail(email, mail.subject, mail.text, mail.html);
  } catch (error) {
    console.error('[auth] فشل إرسال رمز الدخول:', error);
    return NextResponse.json(
      { error: 'تعذّر إرسال الرمز الآن. حاول بعد قليل أو تواصل معنا عبر واتساب.' },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}
