import 'server-only';
import { randomInt } from 'node:crypto';
import type { Order, PointsReason, Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings.server';
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
  tx: Tx | typeof db,
  customerId: string,
  delta: number,
  reason: PointsReason,
  extra: { orderId?: string | null; note?: string | null } = {},
) {
  if (delta === 0) return;
  await tx.pointsTransaction.create({
    data: { customerId, delta, reason, orderId: extra.orderId ?? null, note: extra.note ?? null },
  });
  await tx.customer.update({ where: { id: customerId }, data: { points: { increment: delta } } });
}

/** قيمة النقاط المستبدَلة هذا الشهر بالليرة — لسقف الميزانية */
export async function redeemedThisMonth(settings: SiteSettingsData) {
  const agg = await db.pointsTransaction.aggregate({
    where: { reason: 'ORDER_REDEEM', createdAt: { gte: monthStart() } },
    _sum: { delta: true },
  });
  return -(agg._sum.delta ?? 0) * settings.pointValue;
}

/** ما يمكن لهذا الزبون استبداله الآن على مبلغ معيّن */
export async function customerRedeemable(customerId: string, amount: number) {
  const settings = await getSettings();
  if (!settings.loyaltyEnabled) return { points: 0, amount: 0, blocked: null, balance: 0 };
  const [customer, used] = await Promise.all([
    db.customer.findUnique({ where: { id: customerId }, select: { points: true } }),
    settings.loyaltyMonthlyBudget > 0 ? redeemedThisMonth(settings) : Promise.resolve(0),
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
      await db.customer.update({ where: { id: customerId }, data: { referralCode: code } });
      return code;
    } catch {
      // تصادم نادر — نعيد المحاولة
    }
  }
  throw new Error('تعذّر توليد رمز إحالة.');
}

/**
 * كوبون شخصي (ترحيب/إحالة) بنسبة وسقف ومدة من الإعدادات. يعيد null إن تجاوز السقف الشهري.
 */
export async function issuePersonalCoupon(params: {
  customerId: string;
  source: 'WELCOME' | 'REFERRAL';
  percent: number;
  maxDiscount: number;
  minOrder?: number;
  days: number;
  monthlyCap: number;
  note: string;
}) {
  if (params.monthlyCap > 0) {
    const issued = await db.coupon.count({
      where: { source: params.source, createdAt: { gte: monthStart() } },
    });
    if (issued >= params.monthlyCap) return null;
  }
  const prefix = params.source === 'WELCOME' ? 'WELCOME' : 'FRIEND';
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `${prefix}-${randomCode(5)}`;
    try {
      return await db.coupon.create({
        data: {
          code,
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
        },
      });
    } catch {
      // تصادم كود — نعيد المحاولة
    }
  }
  return null;
}

function couponMail(title: string, intro: string, code: string, expiresAt: Date | null) {
  const until = expiresAt ? ` حتى ${expiresAt.toLocaleDateString('ar-SY')}` : '';
  return {
    subject: `${title} — ${SITE.name}`,
    text: `${intro}\nكود الخصم: ${code}${until}\nاستخدمه في السلة: ${SITE.url}/cart`,
    html: `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#18181b">
  <h2 style="color:#b45309;margin:0 0 12px">${SITE.name}</h2>
  <p>${intro}</p>
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
async function rewardReferral(order: Order, settings: SiteSettingsData) {
  if (!settings.referralEnabled || !order.customerId) return;
  const customer = await db.customer.findUnique({
    where: { id: order.customerId },
    select: {
      id: true,
      email: true,
      name: true,
      referredById: true,
      referredBy: { select: { id: true, email: true } },
    },
  });
  if (!customer?.referredById || !customer.referredBy) return;
  const earlier = await db.order.count({
    where: { customerId: customer.id, confirmedAt: { not: null }, id: { not: order.id } },
  });
  if (earlier > 0) return;
  const common = {
    source: 'REFERRAL' as const,
    percent: settings.referralPercent,
    maxDiscount: settings.referralMaxDiscount,
    days: settings.referralCouponDays,
    monthlyCap: settings.referralMonthlyCap,
  };
  const forReferrer = await issuePersonalCoupon({
    ...common,
    customerId: customer.referredBy.id,
    note: `مكافأة إحالة: ${customer.name}`,
  });
  if (!forReferrer) return;
  const forFriend = await issuePersonalCoupon({
    ...common,
    customerId: customer.id,
    monthlyCap: 0,
    note: 'مكافأة الانضمام بدعوة صديق',
  });
  const m1 = couponMail(
    'شكراً لدعوة صديق',
    `صديقك ${customer.name.split(' ')[0]} أتمّ أول طلب — هذا كوبون ${settings.referralPercent}% لك.`,
    forReferrer.code,
    forReferrer.expiresAt,
  );
  await sendMail(customer.referredBy.email, m1.subject, m1.text, m1.html).catch(() => null);
  if (forFriend) {
    const m2 = couponMail(
      'مكافأتك على الانضمام',
      `شكراً لثقتك — كوبون ${settings.referralPercent}% لطلبك القادم.`,
      forFriend.code,
      forFriend.expiresAt,
    );
    await sendMail(customer.email, m2.subject, m2.text, m2.html).catch(() => null);
  }
}

/** عند أول تأكيد للطلب: منح نقاط الكسب ومكافأة الإحالة */
export async function onOrderConfirmed(order: Order) {
  const settings = await getSettings();
  if (order.customerId && settings.loyaltyEnabled && order.pointsEarned === 0) {
    const earned = pointsForAmount(order.subtotal - order.discount, settings);
    if (earned > 0) {
      await db.$transaction(async (tx) => {
        await addPoints(tx, order.customerId!, earned, 'ORDER_EARN', {
          orderId: order.id,
          note: order.reference,
        });
        await tx.order.update({ where: { id: order.id }, data: { pointsEarned: earned } });
      });
    }
  }
  await rewardReferral(order, settings).catch((e) => console.error('[referral]', e));
}

/** عند الإلغاء: إعادة النقاط المستخدمة وسحب المكتسبة (مرة واحدة) */
export async function onOrderCancelled(order: Order) {
  if (!order.customerId) return;
  await db.$transaction(async (tx) => {
    if (order.pointsUsed > 0) {
      await addPoints(tx, order.customerId!, order.pointsUsed, 'ORDER_REFUND', {
        orderId: order.id,
        note: `إعادة نقاط الطلب ${order.reference}`,
      });
    }
    if (order.pointsEarned > 0) {
      await addPoints(tx, order.customerId!, -order.pointsEarned, 'ORDER_REFUND', {
        orderId: order.id,
        note: `سحب نقاط الطلب الملغى ${order.reference}`,
      });
    }
    await tx.order.update({ where: { id: order.id }, data: { pointsUsed: 0, pointsEarned: 0 } });
  });
}
