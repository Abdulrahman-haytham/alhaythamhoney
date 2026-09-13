import 'server-only';
import nodemailer from 'nodemailer';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { SITE } from '@/lib/config';

/**
 * إرسال البريد عبر أي SMTP (Gmail بكلمة تطبيق، Brevo، Resend SMTP…):
 *   SMTP_URL=smtp://user:pass@smtp-relay.brevo.com:587   MAIL_FROM="الهيثم <no-reply@…>"
 * بلا SMTP_URL (تطوير محلي) تُكتب الرسالة في data/outbox.log وفي الطرفية بدل الإرسال.
 */
export async function sendMail(to: string, subject: string, text: string, html?: string) {
  const url = process.env.SMTP_URL;
  const from = process.env.MAIL_FROM || `${SITE.name} <no-reply@localhost>`;
  if (!url) {
    if (process.env.NODE_ENV === 'production')
      throw new Error('SMTP_URL غير مضبوط — لا يمكن إرسال رموز الدخول.');
    const line = `[${new Date().toISOString()}] to=${to} subject=${subject}\n${text}\n\n`;
    console.info(`[mail] (بلا SMTP) ${line}`);
    const dir = path.join(process.cwd(), 'data');
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, 'outbox.log'), line);
    return;
  }
  const transport = nodemailer.createTransport(url);
  await transport.sendMail({ from, to, subject, text, html });
}

export function loginCodeMail(code: string) {
  const subject = `${code} — رمز الدخول إلى ${SITE.name}`;
  const text = `رمز الدخول الخاص بك: ${code}\nصالح لمدة 10 دقائق. إن لم تطلبه فتجاهل هذه الرسالة.`;
  const html = `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#18181b">
  <h2 style="color:#b45309;margin:0 0 12px">${SITE.name}</h2>
  <p>رمز الدخول الخاص بك:</p>
  <p style="font-size:32px;letter-spacing:8px;font-weight:bold;direction:ltr;text-align:center;background:#fef3c7;padding:12px;border-radius:12px">${code}</p>
  <p style="color:#52525b;font-size:13px">صالح لمدة 10 دقائق. إن لم تطلبه فتجاهل هذه الرسالة.</p>
</div>`;
  return { subject, text, html };
}
