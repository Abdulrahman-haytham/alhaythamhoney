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
      published: false,
      sortOrder: 0,
      relatedIds: [],
      detailedInfo: null,
    };
    expect(productInput.safeParse(product).success).toBe(true);
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
