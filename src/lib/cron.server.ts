import 'server-only';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings.server';
import { sendMail } from '@/lib/mail';
import { SITE } from '@/lib/config';
import { fmtSyp } from '@/lib/pricing';

const DAY = 24 * 3600 * 1000;

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number | null;
  image: string | null;
}

/**
 * بريد «سلتك بانتظارك» للمسجّلين الموافقين على الرسائل: سلة غير فارغة مرّ عليها
 * abandonedCartHours بلا طلب بعدها، ولم تُذكَّر منذ آخر تعديل. رسالة واحدة لكل سلة.
 */
export async function sendAbandonedCartEmails(limit = 100) {
  const settings = await getSettings();
  if (!settings.abandonedCartEmailEnabled) return { sent: 0, skipped: 'disabled' as const };
  const cutoff = new Date(Date.now() - settings.abandonedCartHours * 3600 * 1000);
  const customers = await db.customer.findMany({
    where: {
      marketingOptIn: true,
      cartUpdatedAt: { lte: cutoff },
      cartRemindedAt: null,
    },
    select: { id: true, email: true, name: true, cartJson: true, cartUpdatedAt: true },
    take: limit,
  });
  let sent = 0;
  for (const c of customers) {
    const items = ((c.cartJson as { items?: CartItem[] } | null)?.items ?? []).filter(
      (i) => i && i.quantity > 0,
    );
    if (items.length === 0 || !c.cartUpdatedAt) continue;
    // طلب بعد آخر تعديل للسلة = اشترى فعلاً
    const ordered = await db.order.count({
      where: { customerId: c.id, createdAt: { gte: c.cartUpdatedAt } },
    });
    if (ordered > 0) {
      await db.customer.update({ where: { id: c.id }, data: { cartRemindedAt: new Date() } });
      continue;
    }
    const lines = items
      .map(
        (i) =>
          `• ${i.name} × ${i.quantity}${i.price ? ` — ${fmtSyp(i.price * i.quantity)} ل.س` : ''}`,
      )
      .join('\n');
    const rows = items
      .map(
        (i) =>
          `<tr><td style="padding:6px 0">${i.image ? `<img src="${SITE.url}${i.image}" width="48" height="48" style="border-radius:8px;vertical-align:middle;margin-left:8px">` : ''}${i.name} × ${i.quantity}</td><td style="text-align:left;white-space:nowrap">${i.price ? `${fmtSyp(i.price * i.quantity)} ل.س` : ''}</td></tr>`,
      )
      .join('');
    try {
      await sendMail(
        c.email,
        `سلتك بانتظارك — ${SITE.name}`,
        `مرحباً ${c.name.split(' ')[0]}،\nتركت هذه الأصناف في سلتك:\n${lines}\n\nأكمل طلبك: ${SITE.url}/cart`,
        `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#18181b">
  <h2 style="color:#b45309;margin:0 0 12px">${SITE.name}</h2>
  <p>مرحباً ${c.name.split(' ')[0]}، تركت هذه الأصناف في سلتك:</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
  <p style="margin-top:20px"><a href="${SITE.url}/cart" style="display:inline-block;background:#f59e0b;color:#18181b;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:bold">أكمل طلبك</a></p>
  <p style="color:#71717a;font-size:12px">الأسعار تقديرية وتُؤكَّد على واتساب. لإيقاف هذه الرسائل عدّل تفضيلاتك من حسابك.</p>
</div>`,
      );
      await db.customer.update({ where: { id: c.id }, data: { cartRemindedAt: new Date() } });
      sent++;
    } catch (error) {
      console.error('[cron] abandoned cart mail failed', c.email, error);
    }
  }
  return { sent };
}

/** تنظيف دوري: أحداث أقدم من 90 يوماً، رموز دخول قديمة، حدود معدل منتهية، سجل أقدم من سنة */
export async function pruneOldData() {
  const now = Date.now();
  const [events, codes, limits, audit] = await Promise.all([
    db.event.deleteMany({ where: { createdAt: { lt: new Date(now - 90 * DAY) } } }),
    db.loginCode.deleteMany({ where: { createdAt: { lt: new Date(now - DAY) } } }),
    db.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date(now) } } }),
    db.auditLog.deleteMany({ where: { createdAt: { lt: new Date(now - 365 * DAY) } } }),
  ]);
  return { events: events.count, codes: codes.count, limits: limits.count, audit: audit.count };
}
