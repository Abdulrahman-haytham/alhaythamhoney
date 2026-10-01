import 'server-only';
import { createHmac } from 'node:crypto';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { SITE } from '@/lib/config';

/**
 * عميل بوابة واتساب (`wa-gateway/`): حاوية مستقلة تربط رقماً احتياطياً كواتساب ويب.
 * المصادقة بسرّ مشتقّ من ADMIN_SESSION_SECRET — نفس الحساب في الطرفين.
 * بلا WA_GATEWAY_URL (تطوير محلي) تُكتب الرسالة في data/outbox.log بدل إرسالها.
 */
export interface WhatsAppStatus {
  status: 'unlinked' | 'linking' | 'connecting' | 'open' | 'offline';
  me: string | null;
  qr: string | null;
  pairingCode: string | null;
  mode: 'qr' | 'code' | null;
  lastError: string | null;
  lastErrorAt: string | null;
  connectedAt: string | null;
  sent: number;
  failed: number;
}

export class WhatsAppError extends Error {
  constructor(
    public code: 'not_on_whatsapp' | 'not_connected' | 'unavailable' | 'failed',
    message?: string,
  ) {
    super(message ?? code);
  }
}

const OFFLINE: WhatsAppStatus = {
  status: 'offline',
  me: null,
  qr: null,
  pairingCode: null,
  mode: null,
  lastError: null,
  lastErrorAt: null,
  connectedAt: null,
  sent: 0,
  failed: 0,
};

const gatewayUrl = () => process.env.WA_GATEWAY_URL?.replace(/\/$/, '') || '';

function token() {
  return createHmac('sha256', process.env.ADMIN_SESSION_SECRET || '')
    .update('wa-gateway')
    .digest('hex');
}

async function call<T>(pathname: string, body?: unknown, timeoutMs = 15_000) {
  const res = await fetch(`${gatewayUrl()}${pathname}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { authorization: `Bearer ${token()}`, 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
    cache: 'no-store',
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  return { ok: res.ok, status: res.status, data };
}

/** ردّ يصل لمن يراسل الرقم الآلي (مرة يومياً لكل شخص) */
const autoReply = () =>
  `هذا رقم آلي لإرسال رموز الدخول إلى ${SITE.name} ولا يُقرأ.\nللطلب والاستفسار راسلنا على: https://wa.me/${SITE.phoneNumberDigits}`;

export async function sendWhatsAppText(to: string, text: string): Promise<void> {
  if (!gatewayUrl()) {
    if (process.env.NODE_ENV === 'production')
      throw new WhatsAppError('unavailable', 'WA_GATEWAY_URL غير مضبوط.');
    const line = `[${new Date().toISOString()}] whatsapp to=${to}\n${text}\n\n`;
    console.info(`[whatsapp] (بلا بوابة) ${line}`);
    const dir = path.join(process.cwd(), 'data');
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, 'outbox.log'), line);
    return;
  }
  let result;
  try {
    // قد ينتظر الطلب دوره في طابور الإرسال المتمهّل داخل البوابة
    result = await call('/send', { to, text, reply: autoReply() }, 45_000);
  } catch (error) {
    throw new WhatsAppError('unavailable', String(error));
  }
  if (result.ok) return;
  const code = result.data.error;
  if (code === 'not_on_whatsapp' || code === 'not_connected') throw new WhatsAppError(code);
  throw new WhatsAppError('failed', code);
}

export async function getWhatsAppStatus(): Promise<WhatsAppStatus> {
  if (!gatewayUrl()) return { ...OFFLINE, lastError: 'WA_GATEWAY_URL غير مضبوط.' };
  try {
    const { ok, data } = await call<WhatsAppStatus>('/status', undefined, 5000);
    return ok ? data : { ...OFFLINE, lastError: data.error ?? 'خطأ من البوابة' };
  } catch {
    return { ...OFFLINE, lastError: 'البوابة لا تستجيب — هل حاوية wa تعمل؟' };
  }
}

export async function linkWhatsApp(mode: 'qr' | 'code', phone?: string) {
  const { ok, data } = await call<WhatsAppStatus>('/link', { mode, phone }, 30_000);
  if (!ok) throw new WhatsAppError('failed', data.error);
  return data;
}

export async function unlinkWhatsApp() {
  const { data } = await call<WhatsAppStatus>('/logout', {}, 15_000);
  return data;
}

export function loginCodeMessage(code: string) {
  return `رمز الدخول إلى ${SITE.name}: *${code}*\nصالح 10 دقائق. لا تشاركه مع أحد — لن نطلبه منك أبداً.`;
}
