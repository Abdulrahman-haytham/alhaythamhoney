import { describe, it, expect } from 'vitest';
import { reviewInput, productInput, mixtureInput, articleInput } from '@/lib/validation';
import { renderMarkdown } from '@/lib/markdown';
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
      published: false,
      sortOrder: 0,
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
