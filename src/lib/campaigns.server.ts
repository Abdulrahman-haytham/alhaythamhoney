import 'server-only';
import { randomBytes } from 'node:crypto';
import { db } from '@/lib/db';
import { renderMarkdown, stripHtml } from '@/lib/markdown';
import { sendMail } from '@/lib/mail';
import { SITE } from '@/lib/config';

// دفعة صغيرة: كل دورة مؤقّت تنهي عملها قبل أن تنتهي مهلة الطلب
const BATCH = 5;
const token = () => randomBytes(16).toString('hex');

/** رمز إلغاء الاشتراك للزبون — يُولَّد مرة ويثبت */
export async function ensureUnsubscribeToken(customerId: string) {
  // الكتابة مشروطة بالفراغ: رابط إلغاء اشتراك أُرسل سابقاً يبقى صالحاً
  await db.customer.updateMany({
    where: { id: customerId, unsubscribeToken: null },
    data: { unsubscribeToken: token() },
  });
  return (
    await db.customer.findUniqueOrThrow({
      where: { id: customerId },
      select: { unsubscribeToken: true },
    })
  ).unsubscribeToken!;
}

/** قالب البريد: الشعار، النص، صورة التتبّع، ورابط إلغاء الاشتراك (إلزامي في كل حملة) */
export function campaignHtml(
  bodyHtml: string,
  opts: { unsubscribeUrl: string; pixelUrl?: string },
) {
  return `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#18181b;line-height:1.7">
  <h2 style="color:#b45309;margin:0 0 16px">${SITE.name}</h2>
  ${bodyHtml}
  <hr style="border:0;border-top:1px solid #e4e4e7;margin:24px 0">
  <p style="color:#71717a;font-size:12px">وصلتك هذه الرسالة لأنك وافقت على استلام عروض ${SITE.name}. <a href="${opts.unsubscribeUrl}" style="color:#b45309">إلغاء الاشتراك</a></p>
  ${opts.pixelUrl ? `<img src="${opts.pixelUrl}" width="1" height="1" alt="" style="display:block">` : ''}
</div>`;
}

export async function sendCampaignTest(campaignId: string, email: string) {
  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new Error('الحملة غير موجودة.');
  const html = renderMarkdown(campaign.body);
  await sendMail(
    email,
    `[تجربة] ${campaign.subject}`,
    stripHtml(html),
    campaignHtml(html, { unsubscribeUrl: `${SITE.url}/unsubscribe` }),
  );
}

/**
 * بدء الإرسال: يجمّد قائمة المستلمين (الموافقون على العروض الآن) ويحوّل الحالة إلى SENDING.
 * الإرسال نفسه على دفعات عبر processCampaign حتى لا تنتهي مهلة الطلب مع القوائم الكبيرة.
 */
export async function startCampaign(campaignId: string) {
  return db.$transaction(async (tx) => {
    // الانتقال DRAFT → SENDING شرطي: ضغطتان على «إرسال» لا تبنيان القائمة مرتين
    const claimed = await tx.campaign.updateMany({
      where: { id: campaignId, status: 'DRAFT' },
      data: { status: 'SENDING' },
    });
    if (!claimed.count)
      return (await tx.campaign.findUniqueOrThrow({ where: { id: campaignId } })).recipientsCount;
    const audience = await tx.customer.findMany({
      where: { marketingOptIn: true },
      select: { id: true },
    });
    await tx.campaignRecipient.createMany({
      data: audience.map((c) => ({ campaignId, customerId: c.id, token: token() })),
      skipDuplicates: true,
    });
    await tx.campaign.update({
      where: { id: campaignId },
      data: {
        recipientsCount: audience.length,
        ...(audience.length ? {} : { status: 'SENT', sentAt: new Date() }),
      },
    });
    return audience.length;
  });
}

/**
 * يرسل دفعة ويعيد ما تبقّى؛ حين لا يبقى شيء تُختم الحملة SENT.
 * كل مستلم يُحجز في القاعدة قبل استدعاء SMTP، فلا يراسله عاملان معاً. وانقطاع العامل
 * بعد الحجز حالة غامضة (قد يكون المزوّد قبل الرسالة): تُعلَّم للمراجعة ولا يُعاد إرسالها آلياً.
 */
export async function processCampaign(campaignId: string) {
  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign || campaign.status !== 'SENDING') return { sent: 0, failed: 0, remaining: 0 };
  await db.campaignRecipient.updateMany({
    where: {
      campaignId,
      sentAt: null,
      error: null,
      claimedAt: { lt: new Date(Date.now() - 10 * 60 * 1000) },
    },
    data: {
      error: 'تسليم غير مؤكَّد: انقطع العامل بعد الحجز — راجع سجل المزوّد قبل أي إعادة إرسال',
    },
  });
  const html = renderMarkdown(campaign.body);
  const plain = stripHtml(html);
  const batch = await db.campaignRecipient.findMany({
    where: { campaignId, sentAt: null, error: null, claimedAt: null },
    take: BATCH,
    orderBy: { id: 'asc' },
  });
  let sent = 0;
  let failed = 0;
  const deadline = Date.now() + 15000;
  for (const r of batch) {
    if (Date.now() >= deadline) break;
    const claimed = await db.campaignRecipient.updateMany({
      where: { id: r.id, sentAt: null, error: null, claimedAt: null },
      data: { claimedAt: new Date() },
    });
    if (!claimed.count) continue;
    // الموافقة تُراجَع لحظة الإرسال — من ألغى اشتراكه بعد بناء القائمة لا يُراسَل
    const customer = await db.customer.findUnique({ where: { id: r.customerId } });
    if (!customer?.marketingOptIn) {
      await db.campaignRecipient.update({ where: { id: r.id }, data: { error: 'unsubscribed' } });
      failed++;
      continue;
    }
    try {
      const unsub = await ensureUnsubscribeToken(customer.id);
      const unsubscribeUrl = `${SITE.url}/unsubscribe?t=${unsub}`;
      await sendMail(
        customer.email,
        campaign.subject,
        `${plain}\n\nإلغاء الاشتراك: ${unsubscribeUrl}`,
        campaignHtml(html, { unsubscribeUrl, pixelUrl: `${SITE.url}/api/c/${r.token}` }),
      );
      await db.campaignRecipient.update({ where: { id: r.id }, data: { sentAt: new Date() } });
      sent++;
    } catch {
      await db.campaignRecipient.update({
        where: { id: r.id },
        data: {
          error: 'فشل الإرسال أو نتيجته غير مؤكَّدة: راجع سجل المزوّد — لا إعادة إرسال آلية',
        },
      });
      failed++;
    }
  }
  // العدّادات تُحسب مطلقة تحت قفل صفّ الحملة — لا زيادة على رقم قديم
  const remaining = await db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT id FROM campaigns WHERE id = ${campaignId} FOR UPDATE`;
    const [sentCount, failedCount, pending] = await Promise.all([
      tx.campaignRecipient.count({ where: { campaignId, sentAt: { not: null } } }),
      tx.campaignRecipient.count({ where: { campaignId, sentAt: null, error: { not: null } } }),
      tx.campaignRecipient.count({ where: { campaignId, sentAt: null, error: null } }),
    ]);
    await tx.campaign.update({
      where: { id: campaignId },
      data: {
        sentCount,
        failedCount,
        ...(pending === 0 ? { status: 'SENT', sentAt: new Date() } : {}),
      },
    });
    return pending;
  });
  return { sent, failed, remaining };
}

/** حملة واحدة لكل دورة مؤقّت — إغلاق لوحة الإدارة لا يوقف الإرسال. */
export async function processPendingCampaigns() {
  const campaigns = await db.campaign.findMany({
    where: { status: 'SENDING' },
    orderBy: { updatedAt: 'asc' },
    take: 1,
    select: { id: true },
  });
  for (const campaign of campaigns) await processCampaign(campaign.id);
  return { processed: campaigns.length };
}

/** تسجيل فتح الرسالة (مرة واحدة لكل مستلم) */
export async function trackOpen(recipientToken: string) {
  await db.$transaction(async (tx) => {
    const r = await tx.campaignRecipient.findUnique({ where: { token: recipientToken } });
    if (!r) return;
    // أول طلب للصورة فقط يُحتسب — وهو لا يثبت أن شخصاً قرأ الرسالة
    const opened = await tx.campaignRecipient.updateMany({
      where: { id: r.id, openedAt: null },
      data: { openedAt: new Date() },
    });
    if (opened.count)
      await tx.campaign.update({
        where: { id: r.campaignId },
        data: { openCount: { increment: 1 } },
      });
  });
}
