import 'server-only';
import { randomBytes } from 'node:crypto';
import { db } from '@/lib/db';
import { renderMarkdown, stripHtml } from '@/lib/markdown';
import { sendMail } from '@/lib/mail';
import { SITE } from '@/lib/config';

const BATCH = 20;
const token = () => randomBytes(16).toString('hex');

/** رمز إلغاء الاشتراك للزبون — يُولَّد مرة ويثبت */
export async function ensureUnsubscribeToken(customerId: string) {
  const c = await db.customer.findUnique({
    where: { id: customerId },
    select: { unsubscribeToken: true },
  });
  if (c?.unsubscribeToken) return c.unsubscribeToken;
  const t = token();
  await db.customer.update({ where: { id: customerId }, data: { unsubscribeToken: t } });
  return t;
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
  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new Error('الحملة غير موجودة.');
  if (campaign.status !== 'DRAFT') throw new Error('الحملة أُرسلت من قبل.');
  const audience = await db.customer.findMany({
    where: { marketingOptIn: true },
    select: { id: true },
  });
  await db.$transaction([
    db.campaignRecipient.createMany({
      data: audience.map((c) => ({ campaignId, customerId: c.id, token: token() })),
      skipDuplicates: true,
    }),
    db.campaign.update({
      where: { id: campaignId },
      data: { status: 'SENDING', recipientsCount: audience.length },
    }),
  ]);
  return audience.length;
}

/** يرسل دفعة ويعيد ما تبقّى؛ حين لا يبقى شيء تُختم الحملة SENT */
export async function processCampaign(campaignId: string) {
  const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign || campaign.status !== 'SENDING') return { sent: 0, failed: 0, remaining: 0 };
  const html = renderMarkdown(campaign.body);
  const text = stripHtml(html);
  const batch = await db.campaignRecipient.findMany({
    where: { campaignId, sentAt: null, error: null },
    take: BATCH,
    include: { customer: { select: { id: true, email: true, marketingOptIn: true } } },
  });
  let sent = 0;
  let failed = 0;
  for (const r of batch) {
    // من ألغى اشتراكه بعد بدء الحملة لا يُراسَل
    if (!r.customer.marketingOptIn) {
      await db.campaignRecipient.update({ where: { id: r.id }, data: { error: 'unsubscribed' } });
      failed++;
      continue;
    }
    try {
      const unsub = await ensureUnsubscribeToken(r.customer.id);
      await sendMail(
        r.customer.email,
        campaign.subject,
        text,
        campaignHtml(html, {
          unsubscribeUrl: `${SITE.url}/unsubscribe?t=${unsub}`,
          pixelUrl: `${SITE.url}/api/c/${r.token}`,
        }),
      );
      await db.campaignRecipient.update({ where: { id: r.id }, data: { sentAt: new Date() } });
      sent++;
    } catch (error) {
      await db.campaignRecipient.update({
        where: { id: r.id },
        data: { error: error instanceof Error ? error.message.slice(0, 200) : 'failed' },
      });
      failed++;
    }
  }
  const remaining = await db.campaignRecipient.count({
    where: { campaignId, sentAt: null, error: null },
  });
  await db.campaign.update({
    where: { id: campaignId },
    data: {
      sentCount: { increment: sent },
      failedCount: { increment: failed },
      ...(remaining === 0 ? { status: 'SENT', sentAt: new Date() } : {}),
    },
  });
  return { sent, failed, remaining };
}

/** تسجيل فتح الرسالة (مرة واحدة لكل مستلم) */
export async function trackOpen(recipientToken: string) {
  const r = await db.campaignRecipient.findUnique({ where: { token: recipientToken } });
  if (!r || r.openedAt) return;
  await db.$transaction([
    db.campaignRecipient.update({ where: { id: r.id }, data: { openedAt: new Date() } }),
    db.campaign.update({ where: { id: r.campaignId }, data: { openCount: { increment: 1 } } }),
  ]);
}
