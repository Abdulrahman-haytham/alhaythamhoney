import { z } from 'zod';
import { MIN_JAR_SIZE, MAX_JAR_SIZE, normalizeSizes } from '@/lib/mixturePricing';

const amount = z.number().int().min(0).max(1_000_000_000);
const text = (max: number) => z.string().trim().max(max);
export const productInput = z
  .object({
    slug: text(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: text(150).min(2),
    desc: text(3000).min(10),
    benefit: text(200).nullable(),
    image: text(500).refine(
      (url) =>
        /^\/images\/[a-zA-Z0-9/_-]+\.(webp|png|jpe?g|avif)$/.test(url) ||
        /^\/uploads\/studio\/[a-f0-9-]+\.(webp|png|jpe?g|avif)$/.test(url),
      'اختر صورة محلية من المنتجات أو الاستديو.',
    ),
    badge: text(100).nullable(),
    price: amount.nullable(),
    weight: text(80).nullable(),
    category: z.enum(['HONEY', 'SUPPLEMENT']),
    inStock: z.boolean(),
    published: z.boolean(),
    sortOrder: z.number().int().min(0).max(10000),
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
