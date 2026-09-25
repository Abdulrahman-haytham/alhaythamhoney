import { PRICE_ROUNDING } from '@/lib/money';
/**
 * حساب سعر الخلطة — منطق خالص بلا اعتماد على الخادم أو المتصفح،
 * حتى يُستخدم في بنّاء الخلطة (فوري) وفي أي تحقق لاحق على الخادم بنفس النتيجة.
 */

export interface IngredientSpec {
  id: string;
  name: string;
  note: string | null;
  pricePerGram: number;
  minGrams: number;
  maxGrams: number;
  recommended: number;
  step: number;
}

export interface HoneyOption {
  slug: string;
  name: string;
  image: string;
  pricePerGram: number;
}

/** حدود حجم المرطبان التي يقبلها الأدمن عند ضبط الأحجام المتاحة. */
export const MIN_JAR_SIZE = 100;
export const MAX_JAR_SIZE = 5000;

/**
 * يقرّب إلى أقرب خطوة ويبقى ضمن الحدود.
 * الحدود مطلقة بالغرام كما ضبطها الأدمن ولا تتغير مع حجم المرطبان —
 * جرعة غذاء الملكات القصوى واحدة سواء كان المرطبان 250غ أو كيلوغراماً؛
 * الحجم يغيّر كمية العسل التي تملأ الباقي فقط.
 */
export function clampToStep(
  value: number,
  spec: { minGrams: number; maxGrams: number; step: number },
) {
  const stepped = spec.minGrams + Math.round((value - spec.minGrams) / spec.step) * spec.step;
  return Math.min(spec.maxGrams, Math.max(spec.minGrams, stepped));
}

/** يتحقق من قائمة أحجام يدخلها الأدمن ويعيدها مرتّبة بلا تكرار، أو null إن كانت غير صالحة. */
export function normalizeSizes(input: unknown): number[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > 6) return null;
  const sizes = [...new Set(input.map(Number))].sort((a, b) => a - b);
  const ok = sizes.every((s) => Number.isInteger(s) && s >= MIN_JAR_SIZE && s <= MAX_JAR_SIZE);
  return ok ? sizes : null;
}

export interface PriceBreakdown {
  valid: boolean;
  honeyGrams: number;
  honeyCost: number;
  ingredients: { name: string; grams: number; cost: number }[];
  prepFee: number;
  total: number;
}

export function computePrice(params: {
  size: number;
  honey: HoneyOption;
  specs: IngredientSpec[];
  grams: Record<string, number>;
  prepFee: number;
  /** خلطة بوصفة ثابتة: المالك سعّر المرطبان بنفسه فلا يُحسب من سعر الغرام. */
  fixedPrice?: number | null;
}): PriceBreakdown {
  const ingredients = params.specs.map((s) => {
    const g = params.grams[s.id] ?? s.recommended;
    return { name: s.name, grams: g, cost: g * s.pricePerGram };
  });
  const additiveGrams = ingredients.reduce((sum, i) => sum + i.grams, 0);
  const honeyGrams = Math.max(0, params.size - additiveGrams);
  const honeyCost = honeyGrams * params.honey.pricePerGram;
  const subtotal = honeyCost + ingredients.reduce((sum, i) => sum + i.cost, 0) + params.prepFee;
  // تقريب لأقرب 5 ل.س حتى يبدو السعر مألوفاً لا حسابياً
  const total =
    params.fixedPrice != null
      ? params.fixedPrice
      : Math.round(subtotal / PRICE_ROUNDING) * PRICE_ROUNDING;
  const valid =
    additiveGrams < params.size &&
    params.specs.every((s) => {
      const g = params.grams[s.id] ?? s.recommended;
      return Number.isFinite(g) && g >= s.minGrams && g <= s.maxGrams;
    });
  return { valid, honeyGrams, honeyCost, ingredients, prepFee: params.prepFee, total };
}

/** يستخرج الغرامات من نص الوزن المخزّن مثل "500 غرام". */
export function parseGrams(weight: string | null | undefined): number | null {
  const normalized = weight
    ?.trim()
    .replace(/[٠-٩]/g, (n) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(n)))
    .replace('٫', '.');
  const match = normalized?.match(
    /^(\d+(?:\.\d+)?)\s*(غرام|جرام|غ|جم|g|كغ|كجم|كيلو(?:غرام)?|kg)?$/i,
  );
  if (!match) return null;
  const kg = /^(كغ|كجم|كيلو(?:غرام)?|kg)$/i.test(match[2] ?? '');
  const n = Number(match[1]) * (kg ? 1000 : 1);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** وصف مختصر للوصفة يُستخدم في السلة ورسالة واتساب وسجل الطلب. */
export function describeRecipe(params: {
  size: number;
  honeyName: string;
  ingredients: { name: string; grams: number }[];
}): string {
  const parts = params.ingredients.filter((i) => i.grams > 0).map((i) => `${i.name} ${i.grams}غ`);
  return `${params.size}غ — ${params.honeyName}${parts.length ? ' + ' + parts.join(' + ') : ''}`;
}
