import 'server-only';
import { db } from '@/lib/db';
import { sendMail } from '@/lib/mail';
import { SITE } from '@/lib/config';
import { getSettings } from '@/lib/settings.server';

/**
 * يراسل كل من طلب «أعلمني عند التوفر» على هذا المنتج مرة واحدة، ثم يعلّم الطلب.
 * الأخطاء في بريد واحد لا توقف البقية ولا تُسقط حفظ المنتج.
 */
export async function notifyStockAlerts(productId: string) {
  const settings = await getSettings();
  if (!settings.stockAlertsEnabled) return 0;
  const [product, alerts] = await Promise.all([
    db.product.findUnique({ where: { id: productId }, select: { name: true, slug: true } }),
    db.stockAlert.findMany({ where: { productId, notifiedAt: null }, take: 500 }),
  ]);
  if (!product || alerts.length === 0) return 0;
  const url = `${SITE.url}/product/${product.slug}`;
  let sent = 0;
  for (const alert of alerts) {
    try {
      await sendMail(
        alert.email,
        `عاد ${product.name} إلى المخزون — ${SITE.name}`,
        `خبر سار: «${product.name}» متوفر الآن.\nاطلبه قبل أن ينفد: ${url}\n\nوصلتك هذه الرسالة لأنك طلبت إعلامك عند توفره.`,
        `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#18181b">
  <h2 style="color:#b45309;margin:0 0 12px">${SITE.name}</h2>
  <p>خبر سار: <b>${product.name}</b> متوفر الآن.</p>
  <p><a href="${url}" style="display:inline-block;background:#f59e0b;color:#18181b;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:bold">اطلبه قبل أن ينفد</a></p>
  <p style="color:#52525b;font-size:13px">وصلتك هذه الرسالة لأنك طلبت إعلامك عند توفره.</p>
</div>`,
      );
      await db.stockAlert.update({ where: { id: alert.id }, data: { notifiedAt: new Date() } });
      sent++;
    } catch (error) {
      console.error('[stock-alert] failed', alert.email, error);
    }
  }
  return sent;
}
