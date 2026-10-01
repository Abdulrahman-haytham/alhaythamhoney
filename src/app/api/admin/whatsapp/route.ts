import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { logAudit } from '@/lib/audit.server';
import {
  getWhatsAppStatus,
  linkWhatsApp,
  sendWhatsAppText,
  unlinkWhatsApp,
  WhatsAppError,
  type WhatsAppStatus,
} from '@/lib/whatsapp.server';
import { whatsappInput } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/** الحالة كما تحتاجها الصفحة: رمز QR صورة جاهزة بدل نصّه الخام */
async function present(status: WhatsAppStatus) {
  const { qr, ...rest } = status;
  return {
    ...rest,
    qrImage: qr ? await QRCode.toDataURL(qr, { margin: 1, width: 320 }) : null,
  };
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'غير مصرّح.' }, { status: 401 });
  return NextResponse.json(await present(await getWhatsAppStatus()), {
    headers: { 'Cache-Control': 'no-store' },
  });
}

const actionInput = z.discriminatedUnion('action', [
  z.object({ action: z.literal('link-qr') }),
  z.object({ action: z.literal('link-code'), phone: whatsappInput }),
  z.object({ action: z.literal('unlink') }),
  z.object({ action: z.literal('test'), phone: whatsappInput }),
]);

const GATEWAY_ERRORS: Record<string, string> = {
  already_linked: 'الرقم مربوط فعلاً.',
  bad_phone: 'رقم غير صالح.',
  not_on_whatsapp: 'هذا الرقم غير مسجّل على واتساب.',
  not_connected: 'البوابة غير متصلة — اربط الرقم أولاً.',
  unavailable: 'البوابة لا تستجيب — هل حاوية wa تعمل؟',
};

export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = actionInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'طلب غير صالح.' },
      { status: 400 },
    );
  const input = parsed.data;
  try {
    if (input.action === 'link-qr' || input.action === 'link-code') {
      const status = await linkWhatsApp(
        input.action === 'link-qr' ? 'qr' : 'code',
        input.action === 'link-code' ? input.phone : undefined,
      );
      await logAudit({
        entity: 'whatsapp',
        entityId: 'gateway',
        action: 'status',
        label: 'بدء ربط رقم واتساب',
      });
      return NextResponse.json(await present(status));
    }
    if (input.action === 'unlink') {
      const status = await unlinkWhatsApp();
      await logAudit({
        entity: 'whatsapp',
        entityId: 'gateway',
        action: 'status',
        label: 'فك ربط رقم واتساب',
      });
      return NextResponse.json(await present(status));
    }
    await sendWhatsAppText(input.phone, 'رسالة تجربة من لوحة تحكم الهيثم ✅ — رموز الدخول تعمل.');
    return NextResponse.json({ ok: true });
  } catch (error) {
    const code = error instanceof WhatsAppError ? error.message || error.code : 'unavailable';
    const known = GATEWAY_ERRORS[code] ?? GATEWAY_ERRORS[(error as WhatsAppError).code];
    return NextResponse.json({ error: known ?? `تعذّر: ${code}` }, { status: 502 });
  }
}
