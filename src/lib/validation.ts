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
// ---- متغيّرات المنتج وخصومات الكمية ----
export const variantInput = z
  .object({
    /** معرّف موجود عند التعديل — يُحفظ ليبقى ما في سلال الزبائن صالحاً */
    id: text(50).nullable().optional(),
    label: text(60).min(1, 'اسم المتغيّر مطلوب.'),
    price: amount,
    stockQty: z.number().int().min(0).max(1_000_000).nullable(),
    inStock: z.boolean(),
    isDefault: z.boolean(),
  })
  .strict();
export const tierInput = z
  .object({
    minQty: z.number().int().min(2).max(999),
    discountPercent: z.number().int().min(1).max(90),
  })
  .strict();

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
    category: z.enum(['HONEY', 'SUPPLEMENT', 'BUNDLE']),
    inStock: z.boolean(),
    /** null = لا تتبّع للكمية */
    stockQty: z.number().int().min(0).max(1_000_000).nullable(),
    published: z.boolean(),
    sortOrder: z.number().int().min(0).max(10000),
    /** معرّفات «يُشترى معه عادةً» بالترتيب */
    relatedIds: z.array(text(50).min(1)).max(12),
    variants: z.array(variantInput).max(12),
    tiers: z.array(tierInput).max(6),
    /** مكوّنات الباقة (للفئة BUNDLE فقط) */
    bundleItems: z
      .array(
        z
          .object({ productId: text(50).min(1), quantity: z.number().int().min(1).max(50) })
          .strict(),
      )
      .max(10),
    /** معرّفات قيم الخصائص (نوع الزهرة، المنطقة…) */
    attributeValueIds: z.array(text(50).min(1)).max(40),
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
  .strict()
  .refine(
    (p) => new Set(p.tiers.map((t) => t.minQty)).size === p.tiers.length,
    'شرائح الكمية مكررة.',
  )
  .refine(
    (p) => new Set(p.variants.map((v) => v.label.trim())).size === p.variants.length,
    'أسماء المتغيّرات مكررة.',
  )
  .refine(
    (p) => p.category !== 'BUNDLE' || p.bundleItems.length > 0,
    'الباقة تحتاج مكوّناً واحداً على الأقل.',
  )
  .refine(
    (p) => new Set(p.bundleItems.map((b) => b.productId)).size === p.bundleItems.length,
    'مكوّنات الباقة مكررة.',
  );

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
    requiresLogin: z.boolean(),
    oncePerCustomer: z.boolean(),
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
    tieredPricingEnabled: z.boolean(),
    promotionsEnabled: z.boolean(),
    shippingZonesEnabled: z.boolean(),
    stockAlertsEnabled: z.boolean(),
    productFeedEnabled: z.boolean(),
  })
  .strict();

// ---- حسابات الزبائن ----
export const emailInput = z.string().trim().toLowerCase().email('بريد غير صالح.').max(120);
const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{8,20}$/, 'رقم هاتف غير صالح.')
  .transform((v) => v.replace(/[^\d+]/g, ''));

export const requestCodeInput = z.object({ email: emailInput }).strict();
export const verifyCodeInput = z
  .object({
    email: emailInput,
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'الرمز 6 أرقام.'),
  })
  .strict();
export const profileInput = z
  .object({
    name: text(80).min(2, 'الاسم قصير.'),
    phone,
    city: text(40)
      .transform((v) => (v.length ? v : null))
      .nullable(),
    marketingOptIn: z.boolean(),
  })
  .strict();
export const registerInput = profileInput.extend({ token: z.string().min(10).max(2000) }).strict();

// ---- السحب ورموز المرطبانات ----
export const JAR_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
/** يقبل الرمز بأي صيغة يكتبها الزبون (مسافات/شرطات/أحرف صغيرة) ويطبّعه إلى HY-XXXX-XXXX */
export const jarCodeInput = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, ''))
  .refine((v) => /^HY[A-Z2-9]{8}$/.test(v), 'رمز المرطبان غير صحيح — تأكد من الملصق.')
  .transform((v) => `HY-${v.slice(2, 6)}-${v.slice(6, 10)}`);
export const enterDrawInput = z.object({ code: jarCodeInput }).strict();

export const drawInput = z
  .object({
    title: text(120).min(3),
    prize: text(200).min(2),
    description: text(1000)
      .transform((v) => (v.length ? v : null))
      .nullable(),
    startsAt: isoDay,
    endsAt: isoDay,
    status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'DRAWN']),
    maxEntries: z.number().int().min(0).max(1000),
  })
  .strict()
  .refine((d) => d.startsAt <= d.endsAt, 'تاريخ الانتهاء قبل البداية.');

export const generateCodesInput = z
  .object({
    batch: text(60).min(1, 'اسم الدفعة مطلوب.'),
    count: z.number().int().min(1).max(5000),
  })
  .strict();

// ---- السلة والطلبات ----
const cartLine = z
  .object({
    id: text(300).min(1),
    quantity: z.number().int().min(1).max(999),
  })
  .strict();
export const quoteInput = z
  .object({
    items: z.array(cartLine).max(60),
    couponCode: couponCode.nullable(),
    zoneId: text(50).nullable().optional(),
  })
  .strict();
export const orderInput = quoteInput
  .extend({
    reference: z.string().regex(/^HY-[A-Z2-9]{6}$/, 'مرجع الطلب غير صالح.'),
  })
  .strict()
  .refine((o) => o.items.length > 0, 'السلة فارغة.');
export const orderStatusInput = z
  .object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    notes: text(2000)
      .transform((v) => (v.length ? v : null))
      .nullable(),
  })
  .strict();

// ---- أحداث لوحة المؤشرات ----
export const eventInput = z
  .object({
    type: z.enum(['PRODUCT_VIEW', 'ADD_TO_CART', 'WHATSAPP_CLICK', 'CHECKOUT', 'SEARCH']),
    key: text(120)
      .transform((v) => (v.length ? v : null))
      .nullable()
      .optional(),
    value: z.number().int().min(0).max(1_000_000).nullable().optional(),
  })
  .strict();

// ---- الشحن حسب المحافظة والعروض ----
export const zoneInput = z
  .object({
    name: text(60).min(2, 'اسم المنطقة مطلوب.'),
    cost: amount,
    etaText: optionalText(60),
    active: z.boolean(),
    sortOrder: z.number().int().min(0).max(1000),
  })
  .strict();

export const promotionInput = z
  .object({
    title: text(120).min(3, 'العنوان قصير.'),
    kind: z.enum(['PERCENT_OVER_AMOUNT', 'GIFT_OVER_AMOUNT', 'BUY_X_GET_Y']),
    active: z.boolean(),
    startsAt: isoDay.nullable(),
    endsAt: isoDay.nullable(),
    minSubtotal: amount,
    percent: z.number().int().min(0).max(90),
    maxDiscount: amount.nullable(),
    buyProductId: text(50).nullable(),
    buyQty: z.number().int().min(1).max(99),
    giftProductId: text(50).nullable(),
    giftQty: z.number().int().min(1).max(20),
    showProgress: z.boolean(),
    monthlyBudget: amount,
  })
  .strict()
  .refine((p) => p.kind !== 'PERCENT_OVER_AMOUNT' || p.percent >= 1, 'حدّد نسبة الخصم.')
  .refine((p) => p.kind === 'PERCENT_OVER_AMOUNT' || !!p.giftProductId, 'اختر منتج الهدية.')
  .refine((p) => p.kind !== 'BUY_X_GET_Y' || !!p.buyProductId, 'اختر المنتج المشروط شراؤه.')
  .refine(
    (p) => !p.startsAt || !p.endsAt || p.startsAt <= p.endsAt,
    'تاريخ الانتهاء قبل تاريخ البداية.',
  );

// ---- الخصائص و«أعلمني عند التوفر» ----
export const attributeInput = z
  .object({
    name: text(60).min(2, 'اسم الخاصية مطلوب.'),
    sortOrder: z.number().int().min(0).max(1000),
    /** القيم بالترتيب — تُزامَن مع الموجود بالنص */
    values: z.array(text(60).min(1)).max(60),
  })
  .strict()
  .refine((a) => new Set(a.values.map((v) => v.trim())).size === a.values.length, 'قيم مكررة.');

export const stockAlertInput = z.object({ productId: text(50).min(1), email: emailInput }).strict();
