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

export const JAR_SIZES = [250, 500, 1000] as const;
export type JarSize = (typeof JAR_SIZES)[number];

/** يقرّب إلى أقرب خطوة ويبقى ضمن الحدود. */
export function clampToStep(
  value: number,
  spec: { minGrams: number; maxGrams: number; step: number },
) {
  const stepped = spec.minGrams + Math.round((value - spec.minGrams) / spec.step) * spec.step;
  return Math.min(spec.maxGrams, Math.max(spec.minGrams, stepped));
}

/**
 * يوسّع/يقلّص مواصفات المكوّن حسب حجم المرطبان — النِسب ثابتة كما ضبطها الخبير،
 * والمقادير فقط تتبع الحجم (250غ = نصف الجرعات، 1كغ = ضعفها).
 */
export function scaleSpec(spec: IngredientSpec, size: number, baseSize: number): IngredientSpec {
  const f = size / baseSize;
  const scale = (v: number) => Math.max(spec.step, Math.round((v * f) / spec.step) * spec.step);
  return {
    ...spec,
    minGrams: spec.minGrams === 0 ? 0 : scale(spec.minGrams),
    maxGrams: scale(spec.maxGrams),
    recommended: spec.recommended === 0 ? 0 : scale(spec.recommended),
  };
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
}): PriceBreakdown {
  const ingredients = params.specs.map((s) => {
    const g = params.grams[s.id] ?? s.recommended;
    return { name: s.name, grams: g, cost: g * s.pricePerGram };
  });
  const additiveGrams = ingredients.reduce((sum, i) => sum + i.grams, 0);
  const honeyGrams = Math.max(0, params.size - additiveGrams);
  const honeyCost = honeyGrams * params.honey.pricePerGram;
  const subtotal = honeyCost + ingredients.reduce((sum, i) => sum + i.cost, 0) + params.prepFee;
  // تقريب لأقرب 500 ل.س حتى يبدو السعر مألوفاً لا حسابياً
  const total = Math.round(subtotal / 500) * 500;
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
