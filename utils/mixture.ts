import { getWhatsAppLink } from '../config/site';

export type Goal = 'Immunity' | 'Energy' | 'Fertility' | 'General Health';
export type Age = 'Child' | 'Teen' | 'Adult' | 'Senior';
export type Allergy = 'Yes' | 'No';

export interface StepData {
  goal?: Goal;
  age?: Age;
  allergy?: Allergy;
}

export interface Recommendation {
  name: string;
  ingredients: string;
  desc: string;
  safe: boolean;
}

export const GOAL_LABELS: Record<Goal, string> = {
  Immunity: 'رفع المناعة',
  Energy: 'طاقة ونشاط',
  Fertility: 'دعم الخصوبة',
  'General Health': 'صحة عامة',
};

export const AGE_LABELS: Record<Age, string> = {
  Child: 'طفل (3-12)',
  Teen: 'يافع (13-17)',
  Adult: 'بالغ (18-60)',
  Senior: 'كبير السن (60+)',
};

const GOAL_REF_CODES: Record<Goal, string> = {
  Immunity: 'IMM',
  Energy: 'ENR',
  Fertility: 'FRT',
  'General Health': 'GEN',
};

const AGE_REF_CODES: Record<Age, string> = {
  Child: 'CHD',
  Teen: 'TEN',
  Adult: 'ADT',
  Senior: 'SEN',
};

const CAMPAIGN_STORAGE_KEY = 'mixture_campaign_variant';
const DEFAULT_CAMPAIGN_VARIANT = 'ORG';

/**
 * Reads the campaign variant from `?v=`, persisting it to sessionStorage so it
 * survives internal navigation that drops the query string. Falls back to the
 * last stored variant, then to the default — never throws (private mode / SSR).
 */
export function getCampaignVariant(): string {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('v');
    if (fromUrl) {
      sessionStorage.setItem(CAMPAIGN_STORAGE_KEY, fromUrl);
      return fromUrl;
    }

    const stored = sessionStorage.getItem(CAMPAIGN_STORAGE_KEY);
    if (stored) {
      return stored;
    }
  } catch {
    // window/sessionStorage unavailable — fall through to default
  }

  return DEFAULT_CAMPAIGN_VARIANT;
}

/** Builds a short attribution code, e.g. "A1-IMM-ADT-AL0". */
export function buildMixtureRef(data: StepData): string {
  const variant = getCampaignVariant();
  const goalCode = data.goal ? GOAL_REF_CODES[data.goal] : 'UNK';
  const ageCode = data.age ? AGE_REF_CODES[data.age] : 'UNK';
  const allergyCode = data.allergy === 'Yes' ? 'AL1' : 'AL0';
  return `${variant}-${goalCode}-${ageCode}-${allergyCode}`;
}

export function buildMixtureMessage(data: StepData, rec?: Recommendation): string {
  const ref = buildMixtureRef(data);

  if (!rec || (!data.goal && !data.age)) {
    return [
      'مرحباً الهيثم نحل و عسل، أرغب في طلب خلطة خاصة.',
      `مرجع الطلب: ${ref}`,
    ].join('\n');
  }

  const lines = [
    'مرحباً الهيثم نحل و عسل، لقد استخدمت المساعد الذكي وأرغب في استشارة النحال لطلب خلطة:',
    `- الهدف: ${data.goal ? GOAL_LABELS[data.goal] : 'غير محدد'}`,
    `- العمر: ${data.age ? AGE_LABELS[data.age] : 'غير محدد'}`,
    `- حساسية: ${data.allergy === 'Yes' ? 'نعم' : 'لا'}`,
    `- التوصية المقترحة: ${rec.name} (${rec.ingredients})`,
    '',
    'هل يمكن تأكيد الطلب والمكونات؟',
    `مرجع الطلب: ${ref}`,
  ];
  return lines.join('\n');
}

export function buildMixtureLink(data: StepData, rec?: Recommendation): string {
  return getWhatsAppLink(buildMixtureMessage(data, rec));
}

const ALLERGY_SAFE_RECOMMENDATION: Recommendation = {
  name: 'خلطة خاصة آمنة',
  ingredients: 'عسل طبيعي صافي 100% (بدون حبوب لقاح أو عكبر)',
  desc: 'نظراً لوجود حساسية، ننصح بخلطة مخصصة خالية من منتجات النحل التي قد تسبب تحسساً.',
  safe: true,
};

const CHILD_SAFE_RECOMMENDATION: Recommendation = {
  name: 'خلطة البطل الصغير',
  ingredients: 'عسل + عكبر مخفف (Propolis)',
  desc: 'حماية لطيفة وفعالة تناسب الأطفال في طور النمو، وتُستخدم بإشراف الأهل.',
  safe: false,
};

const TEEN_SAFE_RECOMMENDATION: Recommendation = {
  name: 'خلطة اليافعين المتوازنة',
  ingredients: 'عسل + غبار طلع خفيف',
  desc: 'تركيبة معتدلة تدعم النشاط اليومي والتركيز لدى اليافعين دون مكونات مركزة.',
  safe: false,
};

const FERTILITY_RECOMMENDATION: Recommendation = {
  name: 'إكسير الحياة (Elixir of Life)',
  ingredients: 'عسل + غذاء ملكي + حبوب لقاح + أعشاب خاصة',
  desc: 'تركيبة قوية مصممة خصيصاً لدعم الصحة الإنجابية والنشاط الهرموني.',
  safe: false,
};

const ENERGY_RECOMMENDATION: Recommendation = {
  name: 'الخلطة السوداء (Black Power)',
  ingredients: 'عسل + حبوب لقاح + غذاء ملكي',
  desc: 'مصدر طاقة فوري ومستدام للرياضيين وأصحاب المجهود العالي.',
  safe: false,
};

const IMMUNITY_RECOMMENDATION: Recommendation = {
  name: 'درع المناعة (Immunity Shield)',
  ingredients: 'عسل + عكبر + غذاء ملكي',
  desc: 'حصن منيع ضد العدوى الموسمية وتعزيز للصحة العامة.',
  safe: false,
};

const GENERAL_HEALTH_RECOMMENDATION: Recommendation = {
  name: 'خلطة الحيوية اليومية',
  ingredients: 'عسل + حبوب لقاح',
  desc: 'دعم يومي متوازن للفيتامينات والمعادن والنشاط العام.',
  safe: false,
};

/**
 * Minors (Child/Teen) are routed to a fixed age-appropriate mixture before any
 * goal is considered. This guarantees Fertility/Energy (royal jelly, "special
 * herbs") can never reach a minor, regardless of which goal they picked —
 * previously the goal check ran before the age check, so a child selecting
 * "Fertility" would get the royal-jelly/herbs mixture meant for adults.
 */
export function getRecommendation(currentData: StepData): Recommendation {
  if (currentData.allergy === 'Yes') {
    return ALLERGY_SAFE_RECOMMENDATION;
  }

  if (currentData.age === 'Child') {
    return CHILD_SAFE_RECOMMENDATION;
  }

  if (currentData.age === 'Teen') {
    return TEEN_SAFE_RECOMMENDATION;
  }

  if (currentData.goal === 'Fertility') {
    return FERTILITY_RECOMMENDATION;
  }

  if (currentData.goal === 'Energy') {
    return ENERGY_RECOMMENDATION;
  }

  if (currentData.goal === 'Immunity') {
    return IMMUNITY_RECOMMENDATION;
  }

  // Default / General Health
  return GENERAL_HEALTH_RECOMMENDATION;
}
