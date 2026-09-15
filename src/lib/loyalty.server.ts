import 'server-only';
import { randomInt } from 'node:crypto';
import type { Order, Coupon, PointsReason, Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { commerceTransaction, CommerceError } from '@/lib/commerce.server';
import { escapeHtml } from '@/lib/email-content';
import { getSettings, getCommerceSettings } from '@/lib/settings.server';
import { monthStart } from '@/lib/promotions.server';
import { pointsForAmount, redeemablePoints } from '@/lib/loyalty';
import { sendMail } from '@/lib/mail';
import { SITE } from '@/lib/config';
import { fmtSyp } from '@/lib/pricing';
import type { SiteSettingsData } from '@/lib/settings';

type Tx = Prisma.TransactionClient;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const randomCode = (len: number) =>
  Array.from({ length: len }, () => CODE_ALPHABET[randomInt(0, CODE_ALPHABET.length)]).join('');

/** حركة نقاط + تحديث الرصيد في خطوة واحدة (داخل معاملة إن أُعطيت) */
export async function addPoints(
  tx: Tx,
  customerId: string,
  delta: number,
  reason: PointsReason,
  extra: { orderId?: string | null; note?: string | null; eventKey?: string } = {},
) {
  if (delta === 0) return;
  if (
    extra.eventKey &&
    (await tx.pointsTransaction.findUnique({ where: { eventKey: extra.eventKey } }))
  )
    return;
  const changed = await tx.customer.updateMany({
    where: {
      id: customerId,
      ...(delta < 0 && reason !== 'ORDER_REFUND' ? { points: { gte: -delta } } : {}),
    },
    data: { points: { increment: delta } },
  });
  if (changed.count !== 1) throw new CommerceError('رصيد النقاط لا يكفي. أعد مراجعة الطلب.');
  await tx.pointsTransaction.create({
    data: {
      customerId,
      delta,
      reason,
      orderId: extra.orderId ?? null,
      note: extra.note ?? null,
      eventKey: extra.eventKey,
    },
  });
}

/** قيمة النقاط المستبدَلة هذا الشهر بالليرة — لسقف الميزانية */
export async function redeemedThisMonth(tx: Tx = db) {
  const agg = await tx.order.aggregate({
    where: { createdAt: { gte: monthStart() }, status: { not: 'CANCELLED' } },
    _sum: { pointsDiscount: true },
  });
  return agg._sum.pointsDiscount ?? 0;
}

/** ما يمكن لهذا الزبون استبداله الآن على مبلغ معيّن */
export async function customerRedeemable(
  customerId: string,
  amount: number,
  tx: Tx = db,
  rules?: SiteSettingsData,
) {
  const settings = rules ?? (await getCommerceSettings(tx));
  if (!settings.loyaltyEnabled) return { points: 0, amount: 0, blocked: null, balance: 0 };
  const [customer, used] = await Promise.all([
    tx.customer.findUnique({ where: { id: customerId }, select: { points: true } }),
    settings.loyaltyMonthlyBudget > 0 ? redeemedThisMonth(tx) : Promise.resolve(0),
  ]);
  const balance = customer?.points ?? 0;
  const remainingBudget =
    settings.loyaltyMonthlyBudget > 0 ? Math.max(0, settings.loyaltyMonthlyBudget - used) : null;
  return { ...redeemablePoints({ balance, amount, rules: settings, remainingBudget }), balance };
}

/** رمز إحالة شخصي — يُولَّد عند أول حاجة ويثبت */
export async function ensureReferralCode(customerId: string) {
  const existing = await db.customer.findUnique({
    where: { id: customerId },
    select: { referralCode: true },
  });
  if (existing?.referralCode) return existing.referralCode;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode(6);
    try {
      await db.customer.updateMany({
        where: { id: customerId, referralCode: null },
        data: { referralCode: code },
      });
      return (await db.customer.findUniqueOrThrow({ where: { id: customerId } })).referralCode!;
    } catch {
      // تصادم نادر — نعيد المحاولة
    }
  }
  throw new Error('تعذّر توليد رمز إحالة.');
}

/**
 * كوبون شخصي (ترحيب/إحالة) بنسبة وسقف ومدة من الإعدادات. يعيد null إن تجاوز السقف الشهري.
 */
type PersonalCouponParams = {
  customerId: string;
  source: 'WELCOME' | 'REFERRAL';
  percent: number;
  maxDiscount: number;
  minOrder?: number;
  days: number;
  monthlyCap: number;
  note: string;
  rewardOrderId?: string;
};

export async function issuePersonalCoupon(
  params: PersonalCouponParams,
  tx?: Tx,
): Promise<Coupon | null> {
  if (!tx) return commerceTransaction((client) => issuePersonalCoupon(params, client));
  if (params.source === 'WELCOME') {
    const existing = await tx.coupon.findFirst({
      where: { source: 'WELCOME', customerId: params.customerId },
    });
    if (existing) return existing;
  }
  if (params.monthlyCap > 0) {
    const issued = await tx.coupon.count({
      where: { source: params.source, createdAt: { gte: monthStart() } },
    });
    if (issued >= params.monthlyCap) return null;
  }
  const prefix = params.source === 'WELCOME' ? 'WELCOME' : 'FRIEND';
  return tx.coupon.create({
    data: {
      code: `${prefix}-${randomCode(12)}`,
      type: 'PERCENT',
      value: params.percent,
      minOrder: params.minOrder ?? 0,
      maxDiscount: params.maxDiscount > 0 ? params.maxDiscount : null,
      active: true,
      expiresAt: new Date(Date.now() + params.days * 24 * 3600 * 1000),
      note: params.note,
      requiresLogin: true,
      oncePerCustomer: true,
      customerId: params.customerId,
      source: params.source,
      rewardOrderId: params.rewardOrderId,
    },
  });
}

function couponMail(title: string, intro: string, code: string, expiresAt: Date | null) {
  const until = expiresAt ? ` حتى ${expiresAt.toLocaleDateString('ar-SY')}` : '';
  return {
    subject: `${title} — ${SITE.name}`,
    text: `${intro}\nكود الخصم: ${code}${until}\nاستخدمه في السلة: ${SITE.url}/cart`,
    html: `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#18181b">
  <h2 style="color:#b45309;margin:0 0 12px">${SITE.name}</h2>
  <p>${escapeHtml(intro)}</p>
  <p style="font-size:26px;letter-spacing:3px;font-weight:bold;direction:ltr;text-align:center;background:#fef3c7;padding:12px;border-radius:12px">${code}</p>
  <p style="color:#52525b;font-size:13px">صالح${until}. يُستخدم مرة واحدة من حسابك في <a href="${SITE.url}/cart">السلة</a>.</p>
</div>`,
  };
}

/** كوبون الترحيب عند إنشاء حساب جديد — يُرسل بالبريد ولا يُسقط التسجيل إن فشل */
export async function grantWelcomeCoupon(customerId: string, email: string) {
  const s = await getSettings();
  if (!s.welcomeCouponEnabled) return null;
  const coupon = await issuePersonalCoupon({
    customerId,
    source: 'WELCOME',
    percent: s.welcomePercent,
    maxDiscount: s.welcomeMaxDiscount,
    minOrder: s.welcomeMinOrder,
    days: s.welcomeCouponDays,
    monthlyCap: s.welcomeMonthlyCap,
    note: 'كوبون ترحيب تلقائي',
  }).catch(() => null);
  if (!coupon) return null;
  const customer = await db.customer.findUnique({
    where: { id: customerId },
    select: { marketingOptIn: true },
  });
  if (!customer?.marketingOptIn) return coupon;
  const mail = couponMail(
    'هدية ترحيب',
    `أهلاً بك في ${SITE.name}! خصم ${s.welcomePercent}% على طلبك الأول${s.welcomeMaxDiscount ? ` (حتى ${fmtSyp(s.welcomeMaxDiscount)} ل.س)` : ''}.`,
    coupon.code,
    coupon.expiresAt,
  );
  await sendMail(email, mail.subject, mail.text, mail.html).catch(() => null);
  return coupon;
}

/**
 * مكافأة الإحالة: عند أول تأكيد لطلب زبون مُحال، يحصل هو ومن أحاله على كوبون.
 * تُصرف مرة واحدة لكل زبون مُحال، وتحترم السقف الشهري.
 */
type RewardMail = { email: string; subject: string; text: string; html: string };

/** Create both referral benefits atomically. Delivery happens only after commit. */
async function rewardReferral(
  tx: Tx,
  order: Order,
  settings: SiteSettingsData,
): Promise<RewardMail[]> {
  if (!settings.referralEnabled || !order.customerId) return [];
  const customer = await tx.customer.findUnique({
    where: { id: order.customerId },
    include: { referredBy: true },
  });
  if (!customer?.referredBy || customer.referralRewardedAt) return [];
  const earlier = await tx.order.count({
    where: {
      customerId: customer.id,
      confirmedAt: { not: null },
      id: { not: order.id },
    },
  });
  if (earlier) return [];
  if (settings.referralMonthlyCap > 0) {
    const issued = await tx.coupon.count({
      where: { source: 'REFERRAL', createdAt: { gte: monthStart() } },
    });
    if (issued + 2 > settings.referralMonthlyCap) return [];
  }
  const mails: RewardMail[] = [];
  for (const recipient of [customer.referredBy, customer]) {
    const coupon = await issuePersonalCoupon(
      {
        customerId: recipient.id,
        source: 'REFERRAL',
        percent: settings.referralPercent,
        maxDiscount: settings.referralMaxDiscount,
        days: settings.referralCouponDays,
        monthlyCap: 0,
        note: `مكافأة إحالة الطلب ${order.reference}`,
        rewardOrderId: order.id,
      },
      tx,
    );
    if (coupon && recipient.marketingOptIn)
      mails.push({
        email: recipient.email,
        ...couponMail(
          'مكافأة الإحالة',
          `شكراً لثقتك — كوبون ${settings.referralPercent}% لطلبك القادم.`,
          coupon.code,
          coupon.expiresAt,
        ),
      });
  }
  await tx.customer.update({
    where: { id: customer.id },
    data: { referralRewardedAt: new Date() },
  });
  return mails;
}

export async function onOrderConfirmed(tx: Tx, order: Order): Promise<RewardMail[]> {
  const settings = await getCommerceSettings(tx);
  if (order.customerId && settings.loyaltyEnabled && order.pointsEarned === 0) {
    const earned = pointsForAmount(order.subtotal - order.discount, settings);
    if (earned > 0) {
      await addPoints(tx, order.customerId, earned, 'ORDER_EARN', {
        orderId: order.id,
        note: order.reference,
        eventKey: `order:${order.id}:earn`,
      });
      await tx.order.update({ where: { id: order.id }, data: { pointsEarned: earned } });
    }
  }
  return rewardReferral(tx, order, settings);
}

/** Refund the net benefit once. Already spent earnings become a visible points debt. */
export async function onOrderCancelled(tx: Tx, order: Order) {
  if (order.customerId)
    await addPoints(tx, order.customerId, order.pointsUsed - order.pointsEarned, 'ORDER_REFUND', {
      orderId: order.id,
      note: `تسوية نقاط الطلب الملغى ${order.reference}`,
      eventKey: `order:${order.id}:cancel`,
    });
  await tx.couponRedemption.deleteMany({ where: { orderId: order.id } });
  await tx.coupon.updateMany({ where: { rewardOrderId: order.id }, data: { active: false } });
}

export async function deliverRewardMails(mails: RewardMail[]) {
  for (const mail of mails)
    await sendMail(mail.email, mail.subject, mail.text, mail.html).catch(() =>
      console.error('[referral] notification failed; coupon remains in customer account'),
    );
}
