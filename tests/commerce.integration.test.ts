import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '@prisma/client';
import { DEFAULT_SETTINGS } from '@/lib/settings';

// قاعدة اختبار محلية معزولة باختيار صريح — لا تعمل هذه المجموعة على بيانات تشغيل أبداً.
const url = process.env.TEST_DATABASE_URL;
if (url) {
  const parsed = new URL(url);
  if (!['127.0.0.1', 'localhost'].includes(parsed.hostname) || !parsed.pathname.endsWith('_test'))
    throw new Error('TEST_DATABASE_URL must point to a local database ending in _test.');
  process.env.DATABASE_URL = url;
}
vi.mock('@/lib/mail', () => ({ sendMail: vi.fn().mockResolvedValue(undefined) }));
const { db } = await import('@/lib/db');
const { sendMail } = await import('@/lib/mail');
const { createOrder, quoteCart } = await import('@/lib/quote.server');
const { applyOrderStatus } = await import('@/lib/orders.server');
const { redeemedThisMonth, issuePersonalCoupon } = await import('@/lib/loyalty.server');
const { startCampaign, processCampaign, ensureUnsubscribeToken, trackOpen } =
  await import('@/lib/campaigns.server');
const { issueLoginCode, consumeLoginCode } = await import('@/lib/customer-auth');
const { sendAbandonedCartEmails } = await import('@/lib/cron.server');
const customer = {
  id: 'qa-customer',
  email: 'qa@example.test',
  name: 'عميل اختبار',
  phone: '963900000000',
  city: null,
  marketingOptIn: true,
};
const request = (suffix: string) => ({
  reference: `HY-QA${suffix.padStart(16, 'A')}`,
  items: [{ id: 'qa-product', quantity: 1 }],
  couponCode: null as string | null,
});

async function clean() {
  await db.campaign.deleteMany();
  await db.order.deleteMany();
  await db.coupon.deleteMany();
  await db.customer.deleteMany();
  await db.promotion.deleteMany();
  await db.product.deleteMany();
  await db.loginCode.deleteMany();
  await db.siteSettings.deleteMany();
}

describe.skipIf(!url)('commercial workflow on PostgreSQL', () => {
  beforeEach(async () => {
    await clean();
    vi.mocked(sendMail).mockReset().mockResolvedValue(undefined);
    await db.siteSettings.create({
      data: {
        id: 'site',
        ...DEFAULT_SETTINGS,
        shippingCost: 0,
        freeShippingThreshold: 0,
        promotionsEnabled: false,
      },
    });
    await db.customer.create({ data: customer });
    await db.product.create({
      data: {
        id: 'qa-product',
        slug: 'qa-honey',
        name: 'عسل اختبار',
        desc: 'وصف منتج للاختبار',
        image: '/images/hero.webp',
        price: 100000,
        published: true,
        inStock: true,
        // كمية غير متتبَّعة (null) — التتبّع نفسه يُختبر في «يرفض بنداً غير متاح»
        stockQty: null,
      },
    });
  });
  afterAll(async () => {
    await clean();
    await db.$disconnect();
  });

  it('saves one order across simultaneous retries and replays its original quote', async () => {
    const req = { ...request('B'), expectedTotal: 100000 };
    const results = await Promise.all([createOrder(req, null), createOrder(req, null)]);
    expect(results[0].order?.id).toBe(results[1].order?.id);
    expect(await db.order.count()).toBe(1);
    await db.product.update({ where: { id: 'qa-product' }, data: { price: 120000 } });
    expect((await createOrder(req, null)).quote.total).toBe(100000);
    await expect(
      createOrder({ ...req, items: [{ id: 'qa-product', quantity: 2 }] }, null),
    ).rejects.toThrow('مرجع مستخدم');
    expect((await createOrder({ ...request('C'), expectedTotal: 100000 }, null)).order).toBeNull();
    expect(await db.order.count()).toBe(1);
  });

  it('reserves a once-per-account coupon only once under concurrent checkouts', async () => {
    await db.coupon.create({
      data: { code: 'QA-ONCE', value: 10, type: 'PERCENT', oncePerCustomer: true },
    });
    const results = await Promise.all(
      ['B', 'C'].map((s) =>
        createOrder({ ...request(s), couponCode: 'QA-ONCE', expectedTotal: 90000 }, customer),
      ),
    );
    expect(results.filter((r) => r.order)).toHaveLength(1);
    expect(await db.couponRedemption.count()).toBe(1);
    const id = results.find((r) => r.order)!.order!.id;
    await applyOrderStatus(id, 'CANCELLED', null, null, 'طلب تجريبي');
    expect(await db.couponRedemption.count()).toBe(0);
  });

  it('enforces the points budget, awards and cancels once, and keeps historical discount values', async () => {
    await db.customer.update({ where: { id: customer.id }, data: { points: 100 } });
    await db.siteSettings.update({
      where: { id: 'site' },
      data: {
        loyaltyEnabled: true,
        pointValue: 1000,
        minRedeemPoints: 1,
        maxRedeemPercent: 100,
        loyaltyMonthlyBudget: 50000,
      },
    });
    const results = await Promise.all(
      ['B', 'C'].map((s) =>
        createOrder({ ...request(s), usePoints: true, expectedTotal: 50000 }, customer),
      ),
    );
    expect(results.filter((r) => r.order)).toHaveLength(1);
    const order = results.find((r) => r.order)!.order!;
    expect((await db.customer.findUniqueOrThrow({ where: { id: customer.id } })).points).toBe(50);
    await db.siteSettings.update({ where: { id: 'site' }, data: { pointValue: 2000 } });
    expect(await redeemedThisMonth()).toBe(50000);
    await Promise.all([
      applyOrderStatus(order.id, 'CONFIRMED', null),
      applyOrderStatus(order.id, 'CONFIRMED', null),
    ]);
    expect(await db.pointsTransaction.count({ where: { reason: 'ORDER_EARN' } })).toBe(1);
    await Promise.all([
      applyOrderStatus(order.id, 'CANCELLED', null, null, 'اختبار'),
      applyOrderStatus(order.id, 'CANCELLED', null, null, 'اختبار'),
    ]);
    expect((await db.customer.findUniqueOrThrow({ where: { id: customer.id } })).points).toBe(100);
    expect(await db.pointsTransaction.count({ where: { reason: 'ORDER_REFUND' } })).toBe(1);
    expect(await redeemedThisMonth()).toBe(0);
    await expect(applyOrderStatus(order.id, 'CONFIRMED', null)).rejects.toThrow('مرحلة سابقة');
  });

  it('does not over-reserve a promotion monthly budget', async () => {
    await db.siteSettings.update({ where: { id: 'site' }, data: { promotionsEnabled: true } });
    await db.promotion.create({
      data: { title: 'عرض اختبار', kind: 'PERCENT_OVER_AMOUNT', percent: 10, monthlyBudget: 10000 },
    });
    const results = await Promise.all(
      ['B', 'C'].map((s) => createOrder({ ...request(s), expectedTotal: 90000 }, null)),
    );
    expect(results.filter((r) => r.order)).toHaveLength(1);
    expect((await db.promotionUse.aggregate({ _sum: { amount: true } }))._sum.amount).toBe(10000);
  });

  it('issues welcome coupons once per account and respects the shared issue cap', async () => {
    await db.customer.create({
      data: { ...customer, id: 'qa-friend', email: 'friend@example.test' },
    });
    const params = {
      customerId: customer.id,
      source: 'WELCOME' as const,
      percent: 10,
      maxDiscount: 10000,
      days: 7,
      monthlyCap: 1,
      note: 'اختبار',
    };
    const results = await Promise.all([
      issuePersonalCoupon(params),
      issuePersonalCoupon(params),
      issuePersonalCoupon({ ...params, customerId: 'qa-friend' }),
    ]);
    expect(results[0]?.id).toBe(results[1]?.id);
    expect(await db.coupon.count()).toBe(1);
  });

  it('claims recipients once, rechecks consent, keeps stable unsubscribe tokens and counts a first open once', async () => {
    await db.customer.create({
      data: { ...customer, id: 'qa-optout', email: 'optout@example.test' },
    });
    const campaign = await db.campaign.create({
      data: { subject: 'اختبار', body: 'نص حملة اختبارية فقط' },
    });
    await Promise.all([startCampaign(campaign.id), startCampaign(campaign.id)]);
    await db.customer.update({ where: { id: 'qa-optout' }, data: { marketingOptIn: false } });
    await Promise.all([processCampaign(campaign.id), processCampaign(campaign.id)]);
    expect(sendMail).toHaveBeenCalledTimes(1);
    const tokens = await Promise.all(
      Array.from({ length: 5 }, () => ensureUnsubscribeToken(customer.id)),
    );
    expect(new Set(tokens).size).toBe(1);
    const recipient = await db.campaignRecipient.findFirstOrThrow({
      where: { customerId: customer.id },
    });
    await Promise.all(Array.from({ length: 5 }, () => trackOpen(recipient.token)));
    const result = await db.campaign.findUniqueOrThrow({ where: { id: campaign.id } });
    expect(result).toMatchObject({ status: 'SENT', sentCount: 1, failedCount: 1, openCount: 1 });
  });

  it('flags ambiguous SMTP results and never retries them automatically', async () => {
    const campaign = await db.campaign.create({
      data: { subject: 'اختبار', body: 'نص حملة اختبارية فقط' },
    });
    await startCampaign(campaign.id);
    vi.mocked(sendMail).mockRejectedValue(new Error('connection ended after DATA'));
    await processCampaign(campaign.id);
    await processCampaign(campaign.id);
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect((await db.campaign.findUniqueOrThrow({ where: { id: campaign.id } })).failedCount).toBe(
      1,
    );
  });

  it('uses trusted cart names/prices, escapes names and includes opt-out in reminders', async () => {
    await db.siteSettings.update({
      where: { id: 'site' },
      data: { abandonedCartEmailEnabled: true },
    });
    await db.customer.update({
      where: { id: customer.id },
      data: {
        name: '<img src=x onerror=alert(1)>',
        cartUpdatedAt: new Date(Date.now() - 48 * 3600000),
        cartJson: {
          items: [
            {
              id: 'qa-product',
              quantity: 1,
              name: '<script>evil()</script>',
              price: 1,
              image: 'javascript:evil()',
            },
          ],
        } as Prisma.InputJsonValue,
      },
    });
    await Promise.all([sendAbandonedCartEmails(), sendAbandonedCartEmails()]);
    expect(sendMail).toHaveBeenCalledTimes(1);
    const html = vi.mocked(sendMail).mock.calls[0][3]!;
    expect(html).toContain('عسل اختبار');
    expect(html).toContain('100,000');
    expect(html).toContain('&lt;img');
    expect(html).toContain('/unsubscribe?t=');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('javascript:evil');
  });

  it('consumes an OTP only once across concurrent submissions', async () => {
    const code = await issueLoginCode(customer.email);
    const results = await Promise.all(
      Array.from({ length: 5 }, () => consumeLoginCode(customer.email, code)),
    );
    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it('refuses an unavailable cart line rather than silently creating a partial order', async () => {
    const req = {
      ...request('B'),
      items: [
        { id: 'qa-product', quantity: 1 },
        { id: 'missing', quantity: 1 },
      ],
    };
    expect((await quoteCart(req, null)).dropped).toHaveLength(1);
    expect((await createOrder(req, null)).order).toBeNull();
    expect(await db.order.count()).toBe(0);
  });

  it('drops a line whose tracked stock ran out', async () => {
    // المخزون ما زال ميزة في هذا الفرع: كمية صفر تعني «لا يُطلب» لا مجرد شارة
    await db.product.update({ where: { id: 'qa-product' }, data: { stockQty: 0 } });
    const req = { ...request('B'), items: [{ id: 'qa-product', quantity: 1 }] };
    expect((await quoteCart(req, null)).dropped).toHaveLength(1);
    expect((await createOrder(req, null)).order).toBeNull();
    expect(await db.order.count()).toBe(0);
  });
});
