import { DEFAULT_SETTINGS, type SiteSettingsData } from '@/lib/settings';

/**
 * القيم القابلة للتحرير من لوحة التحكم تُحقن هنا وقت التشغيل:
 * - على الخادم عبر getSettings() (settings.server.ts)
 * - في المتصفح عبر SettingsProvider قبل تصيير بقية الشجرة
 * فتبقى SITE و SHIPPING و getWhatsAppLink تعمل في كل مكان دون تمرير props.
 */
let runtime: SiteSettingsData = DEFAULT_SETTINGS;

export function applyRuntimeSettings(settings: SiteSettingsData) {
  runtime = settings;
}

export function getRuntimeSettings(): SiteSettingsData {
  return runtime;
}

export const SITE = {
  name: 'الهيثم — نحل وعسل',
  tagline: 'عسل طبيعي وخلطات نحل أصيلة من قلب حماة',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3005').replace(/\/$/, ''),
  foundedYear: 1997,
  get phoneNumber() {
    return runtime.phoneDisplay;
  },
  get phoneNumberDigits() {
    return runtime.whatsappNumber;
  },
  get email() {
    return runtime.email ?? '';
  },
  get workingHours() {
    return runtime.workingHours;
  },
  whatsappDefaultMessage: 'مرحباً عسل الهيثم، أود الاستفسار عن المنتج المعروض في الموقع.',
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=100064934053886',
  },
};

/** سنوات الخبرة تُحسب من سنة التأسيس — لا تُكتب يدوياً في أي مكان */
export const yearsOfExperience = (now = new Date()) => now.getFullYear() - SITE.foundedYear;

export const SHIPPING = {
  get cost() {
    return runtime.shippingCost;
  },
  /** 0 = لا توصيل مجاني */
  get freeThreshold() {
    return runtime.freeShippingThreshold;
  },
};

export const getWhatsAppLink = (message?: string) => {
  const text = message?.trim();
  return text
    ? `https://wa.me/${SITE.phoneNumberDigits}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${SITE.phoneNumberDigits}`;
};

export const getTelLink = () => `tel:${SITE.phoneNumber}`;
