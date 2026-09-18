import 'server-only';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings.server';
import { sendMail } from '@/lib/mail';
import { SITE } from '@/lib/config';
import { fmtSyp } from '@/lib/pricing';
import { resolveCartLines } from '@/lib/cart.server';
import { escapeHtml } from '@/lib/email-content';
import { campaignHtml, ensureUnsubscribeToken } from '@/lib/campaigns.server';

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
export async function sendAbandonedCartEmails(limit = 5) {
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
  const deadline = Date.now() + 15000;
  for (const c of customers) {
    if (Date.now() >= deadline) break;
    const raw = (c.cartJson as { items?: CartItem[] } | null)?.items ?? [];
    if (!Array.isArray(raw) || !c.cartUpdatedAt) continue;
    // تُحجز نسخة السلة هذه قبل SMTP: انقطاع العامل لا يكرّر التذكير، وسلة أحدث لا تُعلَّم
    const claimed = await db.customer.updateMany({
      where: {
        id: c.id,
        marketingOptIn: true,
        cartUpdatedAt: c.cartUpdatedAt,
        cartRemindedAt: null,
      },
      data: { cartRemindedAt: new Date() },
    });
    if (!claimed.count) continue;
    // الأسعار تُعاد من القاعدة لا من السلة المحفوظة في المتصفح
    const { lines: resolved } = await resolveCartLines(
      raw
        .filter(
          (i) =>
            i &&
            typeof i.id === 'string' &&
            Number.isInteger(i.quantity) &&
            i.quantity > 0 &&
            i.quantity <= 999,
        )
        .slice(0, 60)
        .map((i) => ({ id: i.id, quantity: i.quantity })),
      settings.tieredPricingEnabled,
    );
    const items = resolved.map((i) => ({ name: i.name, quantity: i.quantity, price: i.unitPrice }));
    if (!items.length) continue;
    // طلب مسجَّل بعد آخر تعديل للسلة = المتابعة صارت على واتساب
    const ordered = await db.order.count({
      where: { customerId: c.id, createdAt: { gte: c.cartUpdatedAt } },
    });
    if (ordered > 0) continue;
    const lines = items
      .map(
        (i) =>
          `• ${i.name} × ${i.quantity}${i.price ? ` — ${fmtSyp(i.price * i.quantity)} ل.س` : ''}`,
      )
      .join('\n');
    const rows = items
      .map(
        (i) =>
          `<tr><td style="padding:6px 0">${escapeHtml(i.name)} × ${i.quantity}</td><td style="text-align:left;white-space:nowrap">${fmtSyp(i.price * i.quantity)} ل.س</td></tr>`,
      )
      .join('');
    try {
      // رابط إلغاء الاشتراك إلزامي في كل بريد تسويقي
      const unsub = await ensureUnsubscribeToken(c.id);
      const unsubscribeUrl = `${SITE.url}/unsubscribe?t=${unsub}`;
      await sendMail(
        c.email,
        `سلتك بانتظارك — ${SITE.name}`,
        `مرحباً ${c.name.split(' ')[0]}،\nتركت هذه الأصناف في سلتك:\n${lines}\n\nأكمل طلبك: ${SITE.url}/cart\nإلغاء الاشتراك: ${unsubscribeUrl}`,
        campaignHtml(
          `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#18181b">
  <h2 style="color:#b45309;margin:0 0 12px">${SITE.name}</h2>
  <p>مرحباً ${escapeHtml(c.name.split(' ')[0])}، تركت هذه الأصناف في سلتك:</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
  <p style="margin-top:20px"><a href="${SITE.url}/cart" style="display:inline-block;background:#f59e0b;color:#18181b;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:bold">أكمل طلبك</a></p>
  <p style="color:#71717a;font-size:12px">الأسعار تقديرية وتُؤكَّد على واتساب. لإيقاف هذه الرسائل عدّل تفضيلاتك من حسابك.</p>
</div>`,
          { unsubscribeUrl },
        ),
      );
      sent++;
    } catch {
      // الحجز تمّ قبل الإرسال: لا نعيد المحاولة آلياً لأن المزوّد قد يكون قبل الرسالة
      console.error('[cron] تعذّر تذكير السلة أو نتيجته غير مؤكَّدة', c.id);
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
