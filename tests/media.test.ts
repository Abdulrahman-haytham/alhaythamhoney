import { describe, expect, it } from 'vitest';
import { isVideoUrl, joinMedia, splitMedia } from '@/lib/media';
import { mixtureInput, productInput } from '@/lib/validation';

const shot = (n: number, ext = 'webp') =>
  `/uploads/studio/00000000-0000-4000-8000-00000000000${n}.${ext}`;

describe('product and mixture media', () => {
  it('shows photos first, then videos, and keeps the first photo as the card image', () => {
    const media = { image: shot(1), images: [shot(2)], videos: [shot(3, 'mp4')] };
    expect(joinMedia(media)).toEqual([shot(1), shot(2), shot(3, 'mp4')]);
    expect(splitMedia(joinMedia(media))).toEqual(media);
    // فيديو رُفع قبل الصور لا يصير صورة البطاقة
    expect(splitMedia([shot(3, 'mov'), shot(2)])).toEqual({
      image: shot(2),
      images: [],
      videos: [shot(3, 'mov')],
    });
    expect(splitMedia([shot(3, 'webm')]).image).toBeNull();
    expect(joinMedia({ image: null, images: [], videos: [] })).toEqual([]);
    expect([shot(1), shot(1, 'MP4'), '/images/a.webp'].map(isVideoUrl)).toEqual([
      false,
      true,
      false,
    ]);
  });

  const product = {
    slug: 'media-honey',
    name: 'عسل',
    desc: 'وصف المنتج للاختبار',
    benefit: null,
    image: shot(1),
    badge: null,
    price: 1000,
    weight: null,
    category: 'HONEY',
    inStock: true,
    stockQty: null,
    published: true,
    sortOrder: 0,
    relatedIds: [],
    variants: [],
    tiers: [],
    bundleItems: [],
    attributeValueIds: [],
    detailedInfo: null,
  };
  const mixture = {
    slug: 'media-mix',
    name: 'المناعة',
    tagline: '',
    desc: 'وصف الخلطة للاختبار',
    image: null,
    prepFee: 0,
    published: true,
    customizable: true,
    fixedPrice: null,
    sizes: [500],
    defaultSize: 500,
    ingredients: [
      {
        id: null,
        name: 'لوز',
        pricePerGram: 1,
        minGrams: 0,
        maxGrams: 50,
        recommended: 20,
        step: 5,
      },
    ],
  };

  it('accepts uploaded videos on both, and nothing else in their place', () => {
    for (const [schema, base] of [
      [productInput, product],
      [mixtureInput, mixture],
    ] as const) {
      const parsed = schema.parse(base);
      expect([parsed.images, parsed.videos]).toEqual([[], []]);
      expect(
        schema.safeParse({ ...base, images: [shot(2)], videos: [shot(3, 'mp4'), shot(4, 'mov')] })
          .success,
      ).toBe(true);
      // صورة في خانة الفيديو، فيديو خارجي، تكرار، وأكثر من الحدّ
      for (const videos of [
        [shot(2)],
        ['https://evil.example/a.mp4'],
        [shot(3, 'mp4'), shot(3, 'mp4')],
        [1, 2, 3, 4, 5].map((n) => shot(n, 'mp4')),
      ])
        expect(schema.safeParse({ ...base, videos }).success, String(videos)).toBe(false);
      expect(schema.safeParse({ ...base, images: [shot(3, 'mp4')] }).success).toBe(false);
    }
  });

  it('lets the owner order mixtures', () => {
    expect(mixtureInput.parse(mixture).sortOrder).toBe(0);
    expect(mixtureInput.parse({ ...mixture, sortOrder: 3 }).sortOrder).toBe(3);
  });
});
