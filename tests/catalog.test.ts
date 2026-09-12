import { describe, it, expect } from 'vitest';
import { reviewInput, productInput, mixtureInput } from '@/lib/validation';
import {
  computePrice,
  scaleSpec,
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
  it('scales zero amounts and clamps within limits', () => {
    expect(scaleSpec({ ...spec, recommended: 0 }, 1000, 500).recommended).toBe(0);
    expect(scaleSpec(spec, 1000, 500).recommended).toBe(100);
    expect(clampToStep(8, { minGrams: 3, maxGrams: 23, step: 5 })).toBe(8);
    expect(clampToStep(1000, spec)).toBe(300);
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
    const input = { prepFee: 10, published: true, ingredients: [spec] };
    expect(mixtureInput.safeParse(input).success).toBe(true);
    expect(mixtureInput.safeParse({ ...input, ingredients: [spec, spec] }).success).toBe(false);
    expect(
      mixtureInput.safeParse({ ...input, ingredients: [{ ...spec, recommended: 999 }] }).success,
    ).toBe(false);
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
