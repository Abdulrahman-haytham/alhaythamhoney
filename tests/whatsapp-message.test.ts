import { describe, expect, it } from 'vitest';
import {
  HOME_MESSAGE,
  cleanUrl,
  pageMessage,
  pageTitle,
  productMessage,
} from '@/lib/whatsappMessage';

describe('WhatsApp messages carry what the visitor is looking at', () => {
  it('names the product, its size, price and link', () => {
    const text = productMessage({
      name: 'عسل القبار',
      weight: '500 غرام',
      price: 1000,
      url: 'https://alhaythamhoney.sy/product/qabbar-honey',
      orderable: true,
    });
    expect(text).toContain('أود طلب');
    expect(text).toContain('عسل القبار — 500 غرام');
    expect(text).toContain('1,000');
    expect(text.split('\n').at(-1)).toBe('https://alhaythamhoney.sy/product/qabbar-honey');
  });

  it('asks instead of orders when the product cannot be ordered, and omits a missing price', () => {
    const text = productMessage({ name: 'غبار الطلع', url: 'u', orderable: false, price: null });
    expect(text).toContain('أود الاستفسار عن');
    expect(text).not.toContain('السعر');
  });

  it('falls back to the page title and link, and to a general greeting at home', () => {
    expect(pageMessage({ title: 'الأسئلة الشائعة', url: 'https://x.sy/faq', isHome: false })).toBe(
      'مرحباً عسل الهيثم، أستفسر بخصوص:\nالأسئلة الشائعة\nhttps://x.sy/faq',
    );
    expect(pageMessage({ title: 'anything', url: 'https://x.sy/', isHome: true })).toBe(
      HOME_MESSAGE,
    );
    expect(pageMessage({ title: '', url: 'https://x.sy/a', isHome: false })).toBe(HOME_MESSAGE);
  });

  it('strips the store name from titles and tracking parameters from links', () => {
    expect(pageTitle('عسل القبار | الهيثم — نحل وعسل', 'الهيثم — نحل وعسل')).toBe('عسل القبار');
    expect(pageTitle('الهيثم — نحل وعسل', 'الهيثم — نحل وعسل')).toBe('الهيثم — نحل وعسل');
    expect(cleanUrl('https://x.sy/shop?ref=abc&utm_source=fb#top')).toBe('https://x.sy/shop');
  });
});
