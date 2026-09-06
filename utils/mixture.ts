import { getWhatsAppLink } from '../config/site';

export type Goal = 'Immunity' | 'Energy' | 'Fertility' | 'General Health';
export type Age = 'Child' | 'Adult' | 'Senior';
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
