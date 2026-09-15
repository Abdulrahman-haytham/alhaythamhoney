import { describe, it, expect } from 'vitest';
import {
  reviewInput,
  productInput,
  mixtureInput,
  articleInput,
  couponInput,
  settingsInput,
  jarCodeInput,
  profileInput,
  drawInput,
  orderInput,
  promotionInput,
  zoneInput,
  attributeInput,
  stockAlertInput,
  registerInput,
  pointsAdjustInput,
  campaignInput,
  cartSyncInput,
  batchInput,
  leadInput,
  leadStatusInput,
} from '@/lib/validation';
import {
  createSessionToken,
  readSessionToken,
  createCustomerToken,
  readCustomerToken,
  createVerifiedEmailToken,
  readVerifiedEmailToken,
} from '@/lib/session';
import { randomJarCode } from '@/lib/draws.server';
import { applyCoupon } from '@/lib/coupons';
import { DEFAULT_SETTINGS, lowStockLabel, isAvailable } from '@/lib/settings';
import { applyRuntimeSettings, getWhatsAppLink, SHIPPING } from '@/lib/config';
import { renderMarkdown } from '@/lib/markdown';
import { generateOrderReference, normalizeOrderReference } from '@/lib/orders';
import {
  buildQuote,
  bestTier,
  whatsappOrderMessage,
  type PricingLine,
  type PromotionRule,
} from '@/lib/pricing';
import {
  defaultVariant,
  priceFrom,
  productAvailable,
  parseCartId,
  variantCartId,
} from '@/lib/variants';
import { diffRecords } from '@/lib/audit.server';
import { pointsForAmount, redeemablePoints } from '@/lib/loyalty';
import { campaignHtml } from '@/lib/campaigns.server';
import {
  bundleAvailable,
  bundleComponentsValue,
  catalogAvailable,
  type BundleComponentLite,
} from '@/lib/bundles';

describe('article body formats', () => {
  it('renders indented raw HTML as HTML, not as a code block', () => {
    const html = renderMarkdown(
      '<h2>عنوان</h2>\n        <p>فقرة <strong>مهمة</strong></p>\n\n        <ul>\n          <li>بند</li>\n        </ul>',
    );
    expect(html).toContain('<h2>عنوان</h2>');
    expect(html).toContain('<li>بند</li>');
    expect(html).not.toContain('<pre>');
    expect(html).not.toContain('&lt;');
  });
  it('renders GFM tables from markdown', () => {
    const html = renderMarkdown('| أ | ب |\n| --- | --- |\n| 1 | 2 |');
    expect(html).toContain('<table>');
    expect(html).toContain('<td>2</td>');
  });
});
import {
  computePrice,
  normalizeSizes,
  parseGrams,
  clampToStep,
  type IngredientSpec,
} from '@/lib/mixturePricing';
import { buildVCard } from '@/lib/vcard';
import { CONTACTS, getContact } from '@/lib/contacts';
import manifest from '@/app/manifest';
import { existsSync } from 'node:fs';
import path from 'node:path';

const spec: IngredientSpec = {
  id: 'i',
  name: 'لوز',
  note: null,
  pricePerGram: 100,
  minGrams: 0,
  maxGrams: 300,
  recommended: 50,
  step: 10,
};
describe('pricing and validation', () => {
  it.each([
    ['500 غرام', 500],
    ['١ كغ', 1000],
    ['0.5 kg', 500],
    ['٥٠٠', 500],
    ['100 مل', null],
    ['', null],
  ])('parses %s', (value, grams) => expect(parseGrams(value as string)).toBe(grams));
  it('clamps grams within the admin limits regardless of jar size', () => {
    expect(clampToStep(8, { minGrams: 3, maxGrams: 23, step: 5 })).toBe(8);
    // فوق الحد الأقصى يُقصّ إليه — لا يستطيع الزبون تجاوز ما ضبطه الأدمن
    expect(clampToStep(1000, spec)).toBe(300);
    expect(clampToStep(-50, spec)).toBe(spec.minGrams);
  });

  it('normalizes admin jar sizes and rejects invalid ones', () => {
    expect(normalizeSizes([500, 250, 500])).toEqual([250, 500]);
    expect(normalizeSizes([50])).toBeNull();
    expect(normalizeSizes([])).toBeNull();
    expect(normalizeSizes([250.5])).toBeNull();
  });
  it('computes a price and blocks recipes that leave no honey', () => {
    const options = {
      size: 500,
      honey: { slug: 'h', name: 'عسل', image: '', pricePerGram: 200 },
      specs: [spec],
      grams: { i: 50 },
      prepFee: 10000,
    };
    expect(computePrice(options)).toMatchObject({ valid: true, honeyGrams: 450, total: 105000 });
    expect(computePrice({ ...options, grams: { i: 500 } }).valid).toBe(false);
  });
  it('rejects spoofed verified reviews and unexpected data types', () => {
    const review = { authorName: 'عميل', body: 'منتج جيد وتجربة رائعة', rating: 5 };
    expect(reviewInput.safeParse(review).success).toBe(true);
    for (const bad of [
      null,
      { ...review, rating: '5' },
      { ...review, orderRef: 'fake' },
      { ...review, authorName: [] },
    ])
      expect(reviewInput.safeParse(bad).success).toBe(false);
  });
  it('only accepts safe product image paths and valid prices', () => {
    const product = {
      slug: 'honey',
      name: 'عسل',
      desc: 'وصف المنتج الطبيعي',
      benefit: null,
      image: '/images/products/black-seed-honey.webp',
      badge: null,
      price: 1000,
      weight: '500 غرام',
      category: 'HONEY',
      inStock: true,
      stockQty: null,
      cutoutImage: null,
      accentColor: null,
      published: false,
      sortOrder: 0,
      relatedIds: [],
      variants: [],
      tiers: [],
      bundleItems: [],
      attributeValueIds: [],
      detailedInfo: null,
    };
    expect(productInput.safeParse(product).success).toBe(true);
    expect(productInput.safeParse({ ...product, accentColor: 'red' }).success).toBe(false);
    expect(productInput.safeParse({ ...product, accentColor: '#A1B2C3' }).success).toBe(true);
    expect(productInput.safeParse({ ...product, cutoutImage: '/images/jar.webp' }).success).toBe(
      true,
    );
    // الباقة تحتاج مكوّنات، ولا تكرار فيها
    expect(productInput.safeParse({ ...product, category: 'BUNDLE' }).success).toBe(false);
    expect(
      productInput.safeParse({
        ...product,
        category: 'BUNDLE',
        bundleItems: [
          { productId: 'a', quantity: 1 },
          { productId: 'a', quantity: 2 },
        ],
      }).success,
    ).toBe(false);
    expect(
      productInput.safeParse({
        ...product,
        category: 'BUNDLE',
        bundleItems: [{ productId: 'a', quantity: 1 }],
      }).success,
    ).toBe(true);
    for (const image of [
      '//evil.example/x.png',
      '/images/../secret.png',
      '/uploads/studio/x.svg',
      'javascript:alert(1)',
    ])
      expect(productInput.safeParse({ ...product, image }).success).toBe(false);
    expect(productInput.safeParse({ ...product, price: -1 }).success).toBe(false);
    expect(productInput.safeParse({ ...product, detailedInfo: { benefits: 'bad' } }).success).toBe(
      false,
    );
  });
  it('rejects invalid ingredient ranges and duplicate IDs', () => {
    const input = {
      prepFee: 10,
      published: true,
      sizes: [500, 1000], // حد المكوّن الأقصى 300غ، فأصغر حجم مسموح هو 500غ
      defaultSize: 500,
      ingredients: [spec],
    };
    expect(mixtureInput.safeParse(input).success).toBe(true);
    expect(mixtureInput.safeParse({ ...input, ingredients: [spec, spec] }).success).toBe(false);
    expect(
      mixtureInput.safeParse({ ...input, ingredients: [{ ...spec, recommended: 999 }] }).success,
    ).toBe(false);
  });

  it('rejects limits that could leave no room for honey', () => {
    const base = { prepFee: 0, published: true, ingredients: [spec] };
    // الحد الأقصى 300غ لا يترك مكاناً للعسل في مرطبان 250غ
    expect(mixtureInput.safeParse({ ...base, sizes: [250], defaultSize: 250 }).success).toBe(false);
    expect(mixtureInput.safeParse({ ...base, sizes: [500], defaultSize: 500 }).success).toBe(true);
    // الحجم الافتراضي يجب أن يكون ضمن الأحجام المتاحة
    expect(mixtureInput.safeParse({ ...base, sizes: [250, 500], defaultSize: 1000 }).success).toBe(
      false,
    );
    expect(mixtureInput.safeParse({ ...base, sizes: [], defaultSize: 500 }).success).toBe(false);
  });
});
describe('restored contact cards and PWA', () => {
  it('keeps the existing slug and rejects inherited object keys', () => {
    expect(getContact('haytham')?.phone).toBe('+963947931959');
    expect(getContact('__proto__')).toBeUndefined();
    expect(getContact('toString')).toBeUndefined();
  });
  it('creates a CRLF vCard with correct escaping and UTF-8 folding', () => {
    const card = buildVCard({ ...CONTACTS.haytham, note: 'سطر\nآخر;فاصلة,\\'.repeat(12) });
    expect(card).toContain('FN:Al-Haytham Honey\r\n');
    expect(card).toContain('TEL;TYPE=CELL:+963947931959');
    expect(card).not.toContain('EMAIL:');
    expect(card).toMatch(/END:VCARD\r\n$/);
    for (const line of card.split('\r\n')) expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75);
    expect(card.replace(/\r\n /g, '')).toContain('سطر\\nآخر\\;فاصلة\\,\\\\');
  });
  it('references real installable icons', () => {
    expect(manifest().name).toBe('الهيثم — نحل وعسل');
    for (const icon of manifest().icons ?? [])
      expect(existsSync(path.join(process.cwd(), 'public', icon.src))).toBe(true);
  });
});
describe('blog articles', () => {
  it('validates admin article input', () => {
    const input = {
      slug: 'honey-benefits',
      title: 'فوائد العسل',
      description: 'وصف قصير يشرح ما في المقال للقارئ ولمحركات البحث.',
      keywords: ['عسل', 'فوائد'],
      image: null,
      body: '## عنوان\n\nفقرة تشرح فوائد العسل الطبيعي بالتفصيل.',
      published: true,
      publishedAt: '2026-09-13',
      productIds: [],
    };
    expect(articleInput.safeParse(input).success).toBe(true);
    for (const bad of [
      { ...input, slug: 'Honey Benefits' },
      { ...input, body: 'قصير' },
      { ...input, publishedAt: '13/09/2026' },
      { ...input, image: 'https://evil.example/x.png' },
      { ...input, extra: 1 },
    ])
      expect(articleInput.safeParse(bad).success).toBe(false);
  });

  it('renders markdown and strips scripts, keeping local images and safe links', () => {
    const html = renderMarkdown(
      '# عنوان\n\n**غامق** و[رابط](https://example.com)\n\n![صورة](/uploads/studio/a.webp)\n\n<script>alert(1)</script><p onclick="x()">نص</p>',
    );
    expect(html).toContain('<h2>عنوان</h2>');
    expect(html).toContain('<strong>غامق</strong>');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('src="/uploads/studio/a.webp"');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('onclick');
    expect(html).not.toContain('alert(1)');
  });
});
describe('coupons and store settings', () => {
  const base = {
    code: 'RAMADAN10',
    type: 'PERCENT' as const,
    value: 10,
    minOrder: 100_000,
    maxDiscount: 30_000,
    active: true,
    startsAt: null,
    expiresAt: null,
  };
  it('applies percent and fixed coupons with limits and dates', () => {
    expect(applyCoupon(base, 200_000)).toMatchObject({ ok: true, discount: 20_000 });
    expect(applyCoupon(base, 900_000)).toMatchObject({ ok: true, discount: 30_000 });
    expect(applyCoupon(base, 50_000).ok).toBe(false);
    expect(applyCoupon({ ...base, active: false }, 200_000).ok).toBe(false);
    expect(applyCoupon({ ...base, expiresAt: new Date('2000-01-01') }, 200_000).ok).toBe(false);
    expect(applyCoupon({ ...base, startsAt: new Date('2999-01-01') }, 200_000).ok).toBe(false);
    expect(applyCoupon(null, 200_000).ok).toBe(false);
    expect(
      applyCoupon({ ...base, type: 'FIXED', value: 500_000, maxDiscount: null }, 200_000),
    ).toMatchObject({ ok: true, discount: 200_000 });
  });
  it('validates coupon and settings input', () => {
    const coupon = {
      ...base,
      startsAt: null,
      expiresAt: null,
      note: null,
      requiresLogin: false,
      oncePerCustomer: false,
    };
    expect(couponInput.safeParse(coupon).success).toBe(true);
    expect(couponInput.safeParse({ ...coupon, code: 'كود عربي' }).success).toBe(false);
    expect(couponInput.safeParse({ ...coupon, value: 150 }).success).toBe(false);
    expect(
      couponInput.safeParse({ ...coupon, startsAt: '2026-05-01', expiresAt: '2026-04-01' }).success,
    ).toBe(false);
    expect(settingsInput.safeParse(DEFAULT_SETTINGS).success).toBe(true);
    expect(settingsInput.safeParse({ ...DEFAULT_SETTINGS, whatsappNumber: '+963' }).success).toBe(
      false,
    );
    expect(
      settingsInput.safeParse({ ...DEFAULT_SETTINGS, announcementLink: 'javascript:x' }).success,
    ).toBe(false);
  });
  it('shows the low-stock badge only inside the admin threshold', () => {
    expect(lowStockLabel(null, 3)).toBeNull();
    expect(lowStockLabel(0, 3)).toBeNull();
    expect(lowStockLabel(5, 3)).toBeNull();
    expect(lowStockLabel(2, 3)).toBe('بقيت قطعتان فقط');
    expect(lowStockLabel(3, 0)).toBeNull();
    expect(isAvailable({ inStock: true, stockQty: 0 })).toBe(false);
    expect(isAvailable({ inStock: true, stockQty: null })).toBe(true);
  });
  it('lets admin settings override contact and shipping constants at runtime', () => {
    applyRuntimeSettings({ ...DEFAULT_SETTINGS, whatsappNumber: '963900000000', shippingCost: 1 });
    expect(getWhatsAppLink('hi')).toBe('https://wa.me/963900000000?text=hi');
    expect(SHIPPING.cost).toBe(1);
    applyRuntimeSettings(DEFAULT_SETTINGS);
    expect(getContact('haytham')?.phone).toBe('+963947931959');
  });
});
describe('customer accounts and draws', () => {
  it('keeps admin and customer sessions cryptographically separate', () => {
    const admin = createSessionToken('a1');
    const customer = createCustomerToken('c1');
    expect(readSessionToken(admin)).toBe('a1');
    expect(readCustomerToken(customer)).toBe('c1');
    expect(readCustomerToken(admin)).toBeNull();
    expect(readSessionToken(customer)).toBeNull();
    const t = createVerifiedEmailToken('Someone@Example.com');
    expect(readVerifiedEmailToken(t)).toBe('Someone@Example.com');
    expect(readVerifiedEmailToken(t.slice(0, -2) + 'zz')).toBeNull();
  });
  it('normalizes jar codes however the customer types them', () => {
    expect(jarCodeInput.parse(' hy 7k3m 9q2x ')).toBe('HY-7K3M-9Q2X');
    expect(jarCodeInput.parse('HY-7K3M-9Q2X')).toBe('HY-7K3M-9Q2X');
    expect(jarCodeInput.safeParse('HY-7K3M-9Q2').success).toBe(false);
    expect(jarCodeInput.safeParse('XX-7K3M-9Q2X').success).toBe(false);
    for (let i = 0; i < 50; i++) expect(jarCodeInput.safeParse(randomJarCode()).success).toBe(true);
  });
  it('validates profiles and draws', () => {
    expect(
      profileInput.parse({ name: 'أحمد', phone: '0947 931 959', city: '', marketingOptIn: true }),
    ).toMatchObject({ phone: '0947931959', city: null });
    expect(
      profileInput.safeParse({ name: 'أ', phone: '09', city: null, marketingOptIn: true }).success,
    ).toBe(false);
    const draw = {
      title: 'سحب',
      prize: 'عسل',
      description: null,
      startsAt: '2026-09-13',
      endsAt: '2026-09-20',
      status: 'OPEN',
      maxEntries: 0,
    };
    expect(drawInput.safeParse(draw).success).toBe(true);
    expect(drawInput.safeParse({ ...draw, endsAt: '2026-09-01' }).success).toBe(false);
  });
  it('gates member-only coupons and once-per-account use', () => {
    const c = {
      code: 'VIP',
      type: 'PERCENT' as const,
      value: 10,
      minOrder: 0,
      maxDiscount: null,
      active: true,
      startsAt: null,
      expiresAt: null,
      oncePerCustomer: true,
    };
    expect(applyCoupon(c, 1000).ok).toBe(false);
    expect(applyCoupon(c, 1000, new Date(), { loggedIn: true, alreadyRedeemed: false }).ok).toBe(
      true,
    );
    expect(applyCoupon(c, 1000, new Date(), { loggedIn: true, alreadyRedeemed: true }).ok).toBe(
      false,
    );
  });
});

describe('orders and pricing engine', () => {
  const lines = [
    {
      cartId: 'p1',
      productId: 'p1',
      name: 'عسل سدر',
      unitPrice: 200_000,
      quantity: 2,
      weight: '500 غرام',
      image: '/images/a.webp',
      recipe: null,
    },
    {
      cartId: 'mix:x:500:sidr:10',
      productId: null,
      name: 'خلطة',
      unitPrice: 150_000,
      quantity: 1,
      weight: '500 غرام',
      image: '/images/b.webp',
      recipe: '500غ — سدر + غذاء ملكات 10غ',
    },
  ];

  it('generates and normalizes unambiguous order references', () => {
    const ref = generateOrderReference();
    expect(ref).toMatch(/^HY-[A-Z2-9]{6}$/);
    expect(ref).not.toMatch(/[O0I1]/);
    expect(normalizeOrderReference(' hy-abcd23 ')).toBe('HY-ABCD23');
    expect(normalizeOrderReference('abcd23')).toBe('HY-ABCD23');
    expect(normalizeOrderReference('HY-ABC')).toBeNull();
    expect(
      orderInput.safeParse({ reference: 'HY-ABCD23', items: [], couponCode: null }).success,
    ).toBe(false);
    expect(
      orderInput.safeParse({
        reference: 'HY-ABCD23',
        items: [{ id: 'p1', quantity: 2 }],
        couponCode: null,
      }).success,
    ).toBe(true);
  });

  it('quotes subtotal, coupon, shipping and free-shipping hints', () => {
    const q = buildQuote({
      lines,
      coupon: { ok: true, code: 'TEN', discount: 55_000, label: 'خصم 10%' },
      shippingCost: 25_000,
      freeShippingThreshold: 600_000,
    });
    expect(q.subtotal).toBe(550_000);
    expect(q.discount).toBe(55_000);
    expect(q.freeShipping).toBe(false);
    expect(q.shipping).toBe(25_000);
    expect(q.total).toBe(520_000);
    expect(q.hints[0]).toContain('105,000');
    const free = buildQuote({
      lines,
      coupon: null,
      shippingCost: 25_000,
      freeShippingThreshold: 500_000,
    });
    expect(free.freeShipping).toBe(true);
    expect(free.total).toBe(550_000);
    const empty = buildQuote({
      lines: [],
      coupon: null,
      shippingCost: 25_000,
      freeShippingThreshold: 0,
    });
    expect(empty.total).toBe(0);
    expect(empty.shipping).toBe(0);
  });

  it('writes the WhatsApp message from the quote with reference and recipe', () => {
    const q = buildQuote({ lines, coupon: null, shippingCost: 25_000, freeShippingThreshold: 0 });
    const msg = whatsappOrderMessage(q, 'HY-ABCD23', 'https://example.com/orders/HY-ABCD23');
    expect(msg).toContain('HY-ABCD23');
    expect(msg).toContain('الوصفة: 500غ — سدر');
    expect(msg).toContain('الإجمالي: 575,000');
    expect(msg).toContain('https://example.com/orders/HY-ABCD23');
  });

  it('keeps only changed fields in audit diffs', () => {
    const changes = diffRecords(
      { name: 'a', price: 1, tags: ['x'], updatedAt: new Date(1), inner: { k: 1 } },
      { name: 'a', price: 2, tags: ['x'], updatedAt: new Date(2), inner: { k: 2 } },
    );
    expect(Object.keys(changes).sort()).toEqual(['inner', 'price']);
    expect(changes.price).toEqual({ from: 1, to: 2 });
  });
});

describe('variants, quantity tiers, promotions and zones', () => {
  const line = (over: Partial<PricingLine> = {}): PricingLine => ({
    cartId: 'p1',
    productId: 'p1',
    variantId: null,
    name: 'عسل سدر',
    unitPrice: 100_000,
    quantity: 1,
    weight: '500 غرام',
    image: null,
    recipe: null,
    ...over,
  });
  const gift = { name: 'شمع عسل', image: null, price: 40_000 };
  const promo = (over: Partial<PromotionRule>): PromotionRule => ({
    id: 'pr',
    title: 'عرض',
    kind: 'PERCENT_OVER_AMOUNT',
    minSubtotal: 0,
    percent: 0,
    maxDiscount: null,
    buyProductId: null,
    buyQty: 1,
    giftProductId: null,
    giftQty: 1,
    showProgress: true,
    remainingBudget: null,
    gift: null,
    ...over,
  });

  it('applies the best quantity tier per line and reports it', () => {
    const q = buildQuote({
      lines: [
        line({
          quantity: 3,
          tiers: [
            { minQty: 3, discountPercent: 10 },
            { minQty: 6, discountPercent: 20 },
          ],
        }),
      ],
      coupon: null,
      shippingCost: 0,
      freeShippingThreshold: 0,
    });
    expect(q.lines[0].lineDiscount).toBe(30_000);
    expect(q.lines[0].lineDiscountLabel).toContain('10%');
    expect(q.adjustments[0]).toEqual({ kind: 'tier', label: 'خصم الكمية', amount: 30_000 });
    expect(q.total).toBe(270_000);
    expect(bestTier([{ minQty: 3, discountPercent: 10 }], 2)).toBeNull();
  });

  it('applies percent and gift promotions with hints and monthly budget caps', () => {
    const rules = [
      promo({ id: 'a', title: 'خصم 5%', percent: 5, minSubtotal: 300_000, maxDiscount: 10_000 }),
      promo({
        id: 'b',
        title: 'هدية',
        kind: 'GIFT_OVER_AMOUNT',
        minSubtotal: 200_000,
        giftProductId: 'g',
        gift,
      }),
    ];
    const small = buildQuote({
      lines: [line()],
      coupon: null,
      shippingCost: 0,
      freeShippingThreshold: 0,
      promotions: rules,
    });
    expect(small.adjustments).toHaveLength(0);
    expect(small.gifts).toHaveLength(0);
    expect(small.hints).toEqual([
      'أضف 200,000 ل.س لتحصل على خصم 5%',
      'أضف 100,000 ل.س لتحصل على شمع عسل هديةً',
    ]);
    const big = buildQuote({
      lines: [line({ quantity: 4 })],
      coupon: null,
      shippingCost: 0,
      freeShippingThreshold: 0,
      promotions: rules,
    });
    expect(big.adjustments).toEqual([{ kind: 'promotion', label: 'خصم 5%', amount: 10_000 }]);
    expect(big.gifts[0]).toMatchObject({ productId: 'g', quantity: 1, value: 40_000 });
    expect(big.promotionsApplied).toEqual([
      { id: 'a', amount: 10_000 },
      { id: 'b', amount: 40_000 },
    ]);
    expect(big.total).toBe(390_000);
    // الميزانية المتبقية أقل من قيمة الهدية → لا هدية ولا رسالة
    const capped = buildQuote({
      lines: [line({ quantity: 4 })],
      coupon: null,
      shippingCost: 0,
      freeShippingThreshold: 0,
      promotions: [{ ...rules[1], remainingBudget: 30_000 }],
    });
    expect(capped.gifts).toHaveLength(0);
    expect(capped.hints).toHaveLength(0);
  });

  it('handles buy X get Y across variants of the same product', () => {
    const rule = promo({
      id: 'c',
      title: 'اشترِ 2 واحصل على 1',
      kind: 'BUY_X_GET_Y',
      buyProductId: 'p1',
      buyQty: 2,
      giftProductId: 'p1',
      giftQty: 1,
      buyProduct: { name: 'عسل سدر' },
      gift: { name: 'عسل سدر', image: null, price: 100_000 },
    });
    const one = buildQuote({
      lines: [line()],
      coupon: null,
      shippingCost: 0,
      freeShippingThreshold: 0,
      promotions: [rule],
    });
    expect(one.gifts).toHaveLength(0);
    expect(one.hints[0]).toBe('أضف 1 من عسل سدر لتحصل على 1 عسل سدر مجاناً');
    const five = buildQuote({
      lines: [
        line({ cartId: 'p1@v1', variantId: 'v1', quantity: 3 }),
        line({ cartId: 'p1@v2', variantId: 'v2', quantity: 2 }),
      ],
      coupon: null,
      shippingCost: 0,
      freeShippingThreshold: 0,
      promotions: [rule],
    });
    expect(five.gifts[0].quantity).toBe(2);
  });

  it('orders coupon after promotions and never discounts below zero', () => {
    const q = buildQuote({
      lines: [line({ quantity: 4 })],
      coupon: { ok: true, code: 'BIG', discount: 1_000_000, label: 'خصم ثابت' },
      shippingCost: 25_000,
      freeShippingThreshold: 0,
      promotions: [promo({ id: 'a', title: 'خصم 10%', percent: 10 })],
      zones: [{ id: 'z', name: 'حلب', cost: 40_000, etaText: '2–3 أيام' }],
      zoneId: 'z',
      shippingLabel: 'حلب · 2–3 أيام',
    });
    expect(q.adjustments.map((a) => a.amount)).toEqual([40_000, 360_000]);
    expect(q.discount).toBe(400_000);
    expect(q.total).toBe(25_000);
    expect(q.shippingLabel).toBe('حلب · 2–3 أيام');
    expect(whatsappOrderMessage(q, 'HY-ABCD23', 'u')).toContain('الشحن (حلب · 2–3 أيام)');
  });

  it('derives cart ids, default variant and price-from', () => {
    const variants = [
      {
        id: 'a',
        label: '250 غرام',
        price: 60_000,
        stockQty: 0,
        inStock: true,
        isDefault: true,
        sortOrder: 0,
      },
      {
        id: 'b',
        label: '500 غرام',
        price: 100_000,
        stockQty: null,
        inStock: true,
        isDefault: false,
        sortOrder: 1,
      },
      {
        id: 'c',
        label: '1 كغ',
        price: 190_000,
        stockQty: 5,
        inStock: false,
        isDefault: false,
        sortOrder: 2,
      },
    ];
    expect(defaultVariant(variants)?.id).toBe('b');
    expect(priceFrom({ price: 1, variants })).toEqual({ price: 100_000, from: false });
    expect(priceFrom({ price: 1, variants: [] })).toEqual({ price: 1, from: false });
    expect(productAvailable({ inStock: true, variants })).toBe(true);
    expect(productAvailable({ inStock: true, variants: [variants[0]] })).toBe(false);
    expect(parseCartId(variantCartId('p', 'v'))).toEqual({ productId: 'p', variantId: 'v' });
    expect(parseCartId('p')).toEqual({ productId: 'p', variantId: null });
  });

  it('validates promotions, zones, variants and tiers', () => {
    const base = {
      title: 'هدية الشتاء',
      kind: 'GIFT_OVER_AMOUNT',
      active: true,
      startsAt: null,
      endsAt: null,
      minSubtotal: 300_000,
      percent: 0,
      maxDiscount: null,
      buyProductId: null,
      buyQty: 1,
      giftProductId: null,
      giftQty: 1,
      showProgress: true,
      monthlyBudget: 500_000,
    };
    expect(promotionInput.safeParse(base).success).toBe(false); // بلا منتج هدية
    expect(promotionInput.safeParse({ ...base, giftProductId: 'g' }).success).toBe(true);
    expect(
      promotionInput.safeParse({ ...base, kind: 'PERCENT_OVER_AMOUNT', percent: 0 }).success,
    ).toBe(false);
    expect(
      promotionInput.safeParse({ ...base, kind: 'BUY_X_GET_Y', giftProductId: 'g' }).success,
    ).toBe(false);
    expect(
      zoneInput.safeParse({ name: 'حماة', cost: 20000, etaText: '', active: true, sortOrder: 0 })
        .data?.etaText,
    ).toBeNull();
    const product = productInput.safeParse({
      slug: 'sidr',
      name: 'عسل سدر',
      desc: 'وصف كافٍ للمنتج هنا',
      benefit: null,
      image: '/images/products/x.webp',
      badge: null,
      price: 100000,
      weight: null,
      category: 'HONEY',
      inStock: true,
      stockQty: null,
      cutoutImage: null,
      accentColor: null,
      published: true,
      sortOrder: 0,
      relatedIds: [],
      bundleItems: [],
      attributeValueIds: [],
      variants: [
        {
          id: null,
          label: '500 غرام',
          price: 100000,
          stockQty: null,
          inStock: true,
          isDefault: true,
        },
        {
          id: null,
          label: '500 غرام',
          price: 190000,
          stockQty: 2,
          inStock: true,
          isDefault: false,
        },
      ],
      tiers: [{ minQty: 3, discountPercent: 10 }],
      detailedInfo: null,
    });
    expect(product.success).toBe(false); // أسماء مكررة
    expect(
      productInput.safeParse({
        slug: 'sidr',
        name: 'عسل سدر',
        desc: 'وصف كافٍ للمنتج هنا',
        benefit: null,
        image: '/images/products/x.webp',
        badge: null,
        price: 100000,
        weight: null,
        category: 'HONEY',
        inStock: true,
        stockQty: null,
        cutoutImage: null,
        accentColor: null,
        published: true,
        sortOrder: 0,
        relatedIds: [],
        bundleItems: [],
        attributeValueIds: [],
        variants: [],
        tiers: [
          { minQty: 3, discountPercent: 10 },
          { minQty: 3, discountPercent: 20 },
        ],
        detailedInfo: null,
      }).success,
    ).toBe(false); // شرائح مكررة
  });
});

describe('bundles and catalog availability', () => {
  const component = (over: Partial<BundleComponentLite['product']> = {}, quantity = 1) => ({
    quantity,
    product: {
      id: 'c',
      slug: 'c',
      name: 'مكوّن',
      image: '/images/c.webp',
      price: 50_000,
      inStock: true,
      stockQty: null,
      published: true,
      variants: [],
      ...over,
    },
  });
  it('is available only when every component is, and reports savings', () => {
    const items = [component(), component({ id: 'd', price: 30_000 }, 2)];
    expect(bundleAvailable(items)).toBe(true);
    expect(bundleComponentsValue(items)).toBe(110_000);
    expect(bundleAvailable([component(), component({ id: 'd', stockQty: 0 })])).toBe(false);
    expect(bundleAvailable([component(), component({ id: 'd', published: false })])).toBe(false);
    expect(bundleComponentsValue([component({ price: null })])).toBeNull();
    expect(catalogAvailable({ category: 'BUNDLE', inStock: true, bundleItems: [] })).toBe(false);
    expect(catalogAvailable({ category: 'HONEY', inStock: true, stockQty: 0 })).toBe(false);
    expect(catalogAvailable({ category: 'HONEY', inStock: true, stockQty: 3 })).toBe(true);
  });
  it('validates attributes and stock alerts', () => {
    expect(
      attributeInput.safeParse({ name: 'نوع الزهرة', sortOrder: 0, values: ['سدر', 'سدر'] })
        .success,
    ).toBe(false);
    expect(
      attributeInput.safeParse({ name: 'نوع الزهرة', sortOrder: 0, values: ['سدر', 'كينا'] })
        .success,
    ).toBe(true);
    expect(stockAlertInput.safeParse({ productId: 'p', email: ' A@B.co ' }).data?.email).toBe(
      'a@b.co',
    );
  });
});

describe('loyalty, referral and personal coupons', () => {
  const rules = {
    loyaltyEnabled: true,
    pointsPerSyp: 10_000,
    pointValue: 500,
    minRedeemPoints: 20,
    maxRedeemPercent: 30,
    loyaltyMonthlyBudget: 0,
  };
  it('earns points per confirmed amount and caps redemption by balance, percent and budget', () => {
    expect(pointsForAmount(305_000, rules)).toBe(30);
    expect(pointsForAmount(0, rules)).toBe(0);
    expect(
      redeemablePoints({ balance: 10, amount: 500_000, rules, remainingBudget: null }),
    ).toEqual({
      points: 0,
      amount: 0,
      blocked: 'تحتاج 20 نقطة على الأقل للاستبدال',
    });
    // 30% من 100,000 = 30,000 → 60 نقطة، والرصيد 40 فقط
    expect(
      redeemablePoints({ balance: 40, amount: 100_000, rules, remainingBudget: null }),
    ).toEqual({ points: 40, amount: 20_000, blocked: null });
    expect(
      redeemablePoints({ balance: 400, amount: 100_000, rules, remainingBudget: null }).points,
    ).toBe(60);
    expect(
      redeemablePoints({ balance: 400, amount: 100_000, rules, remainingBudget: 5_000 }).points,
    ).toBe(10);
    expect(
      redeemablePoints({ balance: 400, amount: 100_000, rules, remainingBudget: 100 }).blocked,
    ).toBe('استُنفدت حصة الاستبدال لهذا الشهر');
    expect(
      redeemablePoints({
        balance: 400,
        amount: 100_000,
        rules: { ...rules, loyaltyEnabled: false },
        remainingBudget: null,
      }).points,
    ).toBe(0);
  });
  it('accepts a personal coupon only from its owner', () => {
    const coupon = {
      code: 'WELCOME-AB2C3',
      type: 'PERCENT' as const,
      value: 10,
      minOrder: 0,
      maxDiscount: 50_000,
      active: true,
      startsAt: null,
      expiresAt: null,
      requiresLogin: true,
      oncePerCustomer: true,
      customerId: 'owner',
    };
    expect(applyCoupon(coupon, 100_000)).toMatchObject({ ok: false });
    expect(
      applyCoupon(coupon, 100_000, new Date(), {
        loggedIn: true,
        alreadyRedeemed: false,
        customerId: 'other',
      }),
    ).toEqual({ ok: false, reason: 'هذا الكوبون شخصي لحساب آخر.' });
    expect(
      applyCoupon(coupon, 100_000, new Date(), {
        loggedIn: true,
        alreadyRedeemed: false,
        customerId: 'owner',
      }),
    ).toMatchObject({ ok: true, discount: 10_000 });
  });
  it('applies points after promotions and coupon in the quote', () => {
    const q = buildQuote({
      lines: [
        {
          cartId: 'p',
          productId: 'p',
          name: 'x',
          unitPrice: 100_000,
          quantity: 1,
          weight: null,
          image: null,
          recipe: null,
        },
      ],
      coupon: { ok: true, code: 'TEN', discount: 10_000, label: 'خصم 10%' },
      shippingCost: 0,
      freeShippingThreshold: 0,
      points: { amount: 20_000, label: 'استبدال 40 نقطة' },
    });
    expect(q.adjustments.map((a) => a.kind)).toEqual(['coupon', 'points']);
    expect(q.total).toBe(70_000);
    expect(
      registerInput.safeParse({
        name: 'زبون جديد',
        phone: '0947931959',
        city: null,
        marketingOptIn: true,
        token: 'x'.repeat(20),
        ref: ' ab2c3d ',
      }).data?.ref,
    ).toBe('AB2C3D');
    expect(pointsAdjustInput.safeParse({ delta: 0, note: 'تصحيح' }).success).toBe(false);
    expect(pointsAdjustInput.safeParse({ delta: -5, note: 'تصحيح' }).success).toBe(true);
  });
});

describe('campaigns and cart sync', () => {
  it('wraps campaign html with unsubscribe link and tracking pixel', () => {
    const html = campaignHtml('<p>مرحباً</p>', {
      unsubscribeUrl: 'https://x/unsubscribe?t=abc',
      pixelUrl: 'https://x/api/c/abc',
    });
    expect(html).toContain('https://x/unsubscribe?t=abc');
    expect(html).toContain('<img src="https://x/api/c/abc"');
    expect(campaignHtml('<p>x</p>', { unsubscribeUrl: 'u' })).not.toContain('<img');
  });
  it('validates campaign and cart-sync payloads', () => {
    expect(campaignInput.safeParse({ subject: 'عرض', body: 'قصير' }).success).toBe(false);
    expect(
      campaignInput.safeParse({ subject: 'وصل السدر', body: 'نص كافٍ للحملة البريدية' }).success,
    ).toBe(true);
    expect(
      cartSyncInput.safeParse({
        items: [{ id: 'p', name: 'عسل', quantity: 2, price: 1000, image: null }],
      }).success,
    ).toBe(true);
    expect(cartSyncInput.safeParse({ items: [{ id: 'p', quantity: 0 }] }).success).toBe(false);
  });
});

describe('batch passports and wholesale leads', () => {
  it('validates batch input and normalizes the code', () => {
    const base = {
      code: 'b-2026-sdr-01',
      title: 'قطاف السدر',
      productId: null,
      region: '',
      harvestDate: '2026-09-01',
      floralSource: 'سدر',
      moisture: null,
      labReportUrl: '/uploads/studio/00000000-0000-4000-8000-000000000001.pdf',
      videoUrl: '/uploads/studio/00000000-0000-4000-8000-000000000002.mp4',
      notes: '',
      published: true,
    };
    const ok = batchInput.safeParse(base);
    expect(ok.success).toBe(true);
    expect(ok.data?.code).toBe('B-2026-SDR-01');
    expect(ok.data?.region).toBeNull();
    expect(ok.data?.notes).toBeNull();
    expect(batchInput.safeParse({ ...base, labReportUrl: '/etc/passwd' }).success).toBe(false);
    expect(batchInput.safeParse({ ...base, videoUrl: 'javascript:x' }).success).toBe(false);
    expect(batchInput.safeParse({ ...base, videoUrl: 'https://youtu.be/x' }).success).toBe(true);
    expect(batchInput.safeParse({ ...base, code: 'bad code!' }).success).toBe(false);
  });
  it('validates wholesale leads and normalizes phone/email', () => {
    const lead = leadInput.safeParse({
      name: 'أبو أحمد',
      business: 'سوبرماركت النور',
      phone: '0947 931 959',
      email: ' Shop@Example.com ',
      city: 'حماة',
      quantity: '',
      message: 'نحتاج 20 كغ سدر شهرياً بعبوات 500 غرام',
    });
    expect(lead.success).toBe(true);
    expect(lead.data?.phone).toBe('0947931959');
    expect(lead.data?.email).toBe('shop@example.com');
    expect(lead.data?.quantity).toBeNull();
    expect(
      leadInput.safeParse({ name: 'x', business: 'y', phone: '1', city: '', message: 'short' })
        .success,
    ).toBe(false);
    expect(leadStatusInput.safeParse({ status: 'WON', notes: '' }).data?.notes).toBeNull();
  });
});
