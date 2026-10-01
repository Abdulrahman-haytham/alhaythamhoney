import { NextResponse } from 'next/server';
import { checkOrigin, readJson } from '@/lib/request-security';
import { rateLimit } from '@/lib/rate-limit';
import { requestCodeInput } from '@/lib/validation';
import { issueLoginCode } from '@/lib/customer-auth';
import { loginCodeMessage, sendWhatsAppText, WhatsAppError } from '@/lib/whatsapp.server';

export const runtime = 'nodejs';

const ERRORS: Record<WhatsAppError['code'], { status: number; error: string }> = {
  not_on_whatsapp: { status: 400, error: 'هذا الرقم غير مسجّل على واتساب — تأكد منه.' },
  not_connected: {
    status: 503,
    error: 'خدمة الرموز متوقفة مؤقتاً. حاول بعد قليل أو اطلب عبر واتساب مباشرة.',
  },
  unavailable: {
    status: 503,
    error: 'خدمة الرموز متوقفة مؤقتاً. حاول بعد قليل أو اطلب عبر واتساب مباشرة.',
  },
  failed: { status: 502, error: 'تعذّر إرسال الرمز الآن. حاول بعد قليل.' },
};

/**
 * يرسل رمز دخول على واتساب. الرد واحد سواء كان للرقم حساب أم لا (لا نكشف الحسابات).
 * الحدود أضيق من البريد: كل رسالة من الرقم الآلي تُحسب عليه عند واتساب.
 */
export async function POST(request: Request) {
  const denied = checkOrigin(request) || (await rateLimit(request, 'login-code-ip', 8, 900));
  if (denied) return denied;
  const parsed = requestCodeInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'رقم غير صالح.' },
      { status: 400 },
    );
  const { phone } = parsed.data;
  const perPhone =
    (await rateLimit(request, 'login-code-phone', 3, 900, phone)) ||
    (await rateLimit(request, 'login-code-phone-day', 10, 86_400, phone));
  if (perPhone) return perPhone;
  const code = await issueLoginCode(phone);
  try {
    await sendWhatsAppText(phone, loginCodeMessage(code));
  } catch (error) {
    const known = error instanceof WhatsAppError ? ERRORS[error.code] : ERRORS.failed;
    if (!(error instanceof WhatsAppError) || error.code !== 'not_on_whatsapp')
      console.error('[auth] فشل إرسال رمز الدخول:', error);
    return NextResponse.json({ error: known.error }, { status: known.status });
  }
  return NextResponse.json({ ok: true });
}
