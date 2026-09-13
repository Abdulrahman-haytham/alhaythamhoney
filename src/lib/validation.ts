import { z } from 'zod';
import { MIN_JAR_SIZE, MAX_JAR_SIZE, normalizeSizes } from '@/lib/mixturePricing';

const amount = z.number().int().min(0).max(1_000_000_000);
const text = (max: number) => z.string().trim().max(max);
const isoDay = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((d) => !Number.isNaN(Date.parse(`${d}T00:00:00Z`)), 'تاريخ غير صالح.');
const slug = text(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
/** صورة محلية فقط: من مجلد الصور أو مما رُفع عبر الاستديو. */
const localImage = text(500).refine(
  (url) =>
    /^\/images\/[a-zA-Z0-9/_-]+\.(webp|png|jpe?g|avif)$/.test(url) ||
    /^\/uploads\/studio\/[a-f0-9-]+\.(webp|png|jpe?g|avif)$/.test(url),
  'اختر صورة محلية من المنتجات أو الاستديو.',
);
export const productInput = z
  .object({
    slug,
    name: text(150).min(2),
    desc: text(3000).min(10),
    benefit: text(200).nullable(),
    image: localImage,
    badge: text(100).nullable(),
    price: amount.nullable(),
    weight: text(80).nullable(),
    category: z.enum(['HONEY', 'SUPPLEMENT']),
    inStock: z.boolean(),
    /** null = لا تتبّع للكمية */
    stockQty: z.number().int().min(0).max(1_000_000).nullable(),
    published: z.boolean(),
    sortOrder: z.number().int().min(0).max(10000),
    /** معرّفات «يُشترى معه عادةً» بالترتيب */
    relatedIds: z.array(text(50).min(1)).max(12),
    detailedInfo: z
      .object({
        uses: z.array(text(400)).max(20).optional(),
        benefits: z.array(text(400)).max(20).optional(),
        properties: z.array(text(400)).max(20).optional(),
        howToUse: text(3000).optional(),
      })
      .strict()
      .nullable(),
  })
  .strict();

export const reviewInput = z
  .object({
    productSlug: text(100).min(1).optional(),
    authorName: text(60).min(2),
    authorCity: text(40).optional(),
    rating: z.number().int().min(1).max(5),
    body: text(1000).min(10),
  })
  .strict();

const ingredientInput = z
  .object({
    id: text(100).min(1),
    name: text(150).optional(),
    pricePerGram: amount,
    minGrams: amount,
    maxGrams: amount,
    recommended: amount,
    step: z.number().int().min(1).max(1000),
    note: text(300).nullable().optional(),
  })
  .refine(
    (i) => i.minGrams <= i.recommended && i.recommended <= i.maxGrams,
    'الموصى به يجب أن يقع بين الحد الأدنى والأقصى.',
  );
const jarSize = z.number().int().min(MIN_JAR_SIZE).max(MAX_JAR_SIZE);

export const mixtureInput = z
  .object({
    prepFee: amount,
    published: z.boolean(),
    sizes: z.array(jarSize).min(1).max(6),
    defaultSize: jarSize,
    ingredients: z.array(ingredientInput).min(1).max(30),
  })
  .strict()
  .refine(
    (m) => new Set(m.ingredients.map((i) => i.id)).size === m.ingredients.length,
    'المكوّنات المكررة غير مسموحة.',
  )
  .refine((m) => normalizeSizes(m.sizes) !== null, 'الأحجام غير صالحة.')
  .refine((m) => m.sizes.includes(m.defaultSize), 'الحجم الافتراضي يجب أن يكون من الأحجام المتاحة.')
  .refine(
    // الضمان الأهم: حتى لو رفع الزبون كل مكوّن إلى حدّه الأقصى يبقى مكان للعسل
    // في أصغر مرطبان. هذا يجعل الحدود التي يضبطها الأدمن آمنة بذاتها.
    (m) => m.ingredients.reduce((sum, i) => sum + i.maxGrams, 0) < Math.min(...m.sizes),
    'مجموع الحدود القصوى يجب أن يبقي مساحة للعسل في أصغر حجم — خفّض الحدود أو احذف الحجم الصغير.',
  );

export const articleInput = z
  .object({
    slug,
    title: text(200).min(3),
    description: text(400).min(10),
    keywords: z.array(text(60).min(1)).max(20),
    image: localImage.nullable(),
    /** Markdown مع HTML بسيط — يُعقَّم عند العرض. */
    body: z
      .string()
      .max(200_000)
      .refine((b) => b.trim().length >= 20, 'المقال قصير جداً.'),
    published: z.boolean(),
    publishedAt: isoDay,
    /** معرّفات المنتجات المذكورة في المقال */
    productIds: z.array(text(50).min(1)).max(12),
  })
  .strict();

const couponCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9-]{3,30}$/, 'الكود: حروف إنجليزية وأرقام وشرطة فقط (3–30).');

export const couponInput = z
  .object({
    code: couponCode,
    type: z.enum(['PERCENT', 'FIXED']),
    value: z.number().int().min(1).max(1_000_000_000),
    minOrder: amount,
    maxDiscount: amount.nullable(),
    active: z.boolean(),
    startsAt: isoDay.nullable(),
    expiresAt: isoDay.nullable(),
    note: text(200).nullable(),
  })
  .strict()
  .refine((c) => c.type !== 'PERCENT' || c.value <= 100, 'النسبة المئوية بين 1 و100.')
  .refine(
    (c) => !c.startsAt || !c.expiresAt || c.startsAt <= c.expiresAt,
    'تاريخ الانتهاء قبل تاريخ البداية.',
  );

/** ما يرسله الزائر من السلة للتحقق من كوبون */
export const couponCheckInput = z.object({ code: couponCode, subtotal: amount }).strict();

const optionalText = (max: number) =>
  text(max)
    .transform((v) => (v.length ? v : null))
    .nullable();

export const settingsInput = z
  .object({
    whatsappNumber: z
      .string()
      .trim()
      .regex(/^[1-9]\d{7,14}$/, 'رقم واتساب دولي بلا + (مثال 963947931959).'),
    phoneDisplay: text(30).min(5),
    email: optionalText(120).refine(
      (v) => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      'بريد غير صالح.',
    ),
    workingHours: text(120).min(3),
    shippingCost: amount,
    freeShippingThreshold: amount,
    heroBadge: text(80).min(2),
    heroTitle: text(120).min(3),
    heroHighlight: text(120).min(2),
    heroSubtitle: text(300).min(10),
    heroImage: localImage.nullable(),
    announcementEnabled: z.boolean(),
    announcementText: optionalText(200),
    announcementLink: optionalText(300).refine(
      (v) => v === null || /^\/[^\s]*$/.test(v) || /^https:\/\/[^\s]+$/.test(v),
      'الرابط يبدأ بـ / أو https://',
    ),
    lowStockThreshold: z.number().int().min(0).max(1000),
    showRecentlyViewed: z.boolean(),
    autoRelatedProducts: z.boolean(),
    cartReminderEnabled: z.boolean(),
    cartReminderHours: z.number().int().min(1).max(720),
    couponsEnabled: z.boolean(),
  })
  .strict();
