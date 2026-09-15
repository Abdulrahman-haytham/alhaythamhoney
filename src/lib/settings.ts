/**
 * إعدادات الموقع القابلة للتحرير من لوحة التحكم (/admin/settings).
 * هذا الملف مشترك بين الخادم والمتصفح؛ القراءة من القاعدة في settings.server.ts.
 */
export interface SiteSettingsData {
  whatsappNumber: string;
  phoneDisplay: string;
  email: string | null;
  workingHours: string;
  shippingCost: number;
  freeShippingThreshold: number;
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroImage: string | null;
  announcementEnabled: boolean;
  announcementText: string | null;
  announcementLink: string | null;
  lowStockThreshold: number;
  showRecentlyViewed: boolean;
  autoRelatedProducts: boolean;
  cartReminderEnabled: boolean;
  cartReminderHours: number;
  couponsEnabled: boolean;
  tieredPricingEnabled: boolean;
  promotionsEnabled: boolean;
  shippingZonesEnabled: boolean;
  stockAlertsEnabled: boolean;
  productFeedEnabled: boolean;
  loyaltyEnabled: boolean;
  pointsPerSyp: number;
  pointValue: number;
  minRedeemPoints: number;
  maxRedeemPercent: number;
  loyaltyMonthlyBudget: number;
  referralEnabled: boolean;
  referralPercent: number;
  referralMaxDiscount: number;
  referralCouponDays: number;
  referralMonthlyCap: number;
  wholesaleEnabled: boolean;
  abandonedCartEmailEnabled: boolean;
  abandonedCartHours: number;
  welcomeCouponEnabled: boolean;
  welcomePercent: number;
  welcomeMaxDiscount: number;
  welcomeMinOrder: number;
  welcomeCouponDays: number;
  welcomeMonthlyCap: number;
}

/** القيم الافتراضية — مطابقة لـ @default في schema.prisma وتُستخدم قبل أول حفظ. */
export const DEFAULT_SETTINGS: SiteSettingsData = {
  whatsappNumber: '963947931959',
  phoneDisplay: '+963947931959',
  email: 'info@alhaythamhoney.sy',
  workingHours: 'يومياً من 9 صباحاً حتى 9 مساءً',
  shippingCost: 25000,
  freeShippingThreshold: 500000,
  heroBadge: 'إرث عائلي موثوق منذ 1997',
  heroTitle: 'عسل طبيعي 100% من مراعي سوريا',
  heroHighlight: 'الهيثم — نحل وعسل – منذ 1997',
  heroSubtitle: 'نقدّم عسلًا 100% طبيعي، مفحوصًا مخبريًا، من الخلية إلى مائدتك بلا أي إضافات.',
  heroImage: null,
  announcementEnabled: false,
  announcementText: null,
  announcementLink: null,
  lowStockThreshold: 3,
  showRecentlyViewed: true,
  autoRelatedProducts: true,
  cartReminderEnabled: true,
  cartReminderHours: 12,
  couponsEnabled: true,
  tieredPricingEnabled: true,
  promotionsEnabled: true,
  shippingZonesEnabled: false,
  stockAlertsEnabled: true,
  productFeedEnabled: true,
  loyaltyEnabled: false,
  pointsPerSyp: 10000,
  pointValue: 500,
  minRedeemPoints: 20,
  maxRedeemPercent: 30,
  loyaltyMonthlyBudget: 0,
  referralEnabled: false,
  referralPercent: 10,
  referralMaxDiscount: 50000,
  referralCouponDays: 30,
  referralMonthlyCap: 0,
  wholesaleEnabled: true,
  abandonedCartEmailEnabled: false,
  abandonedCartHours: 24,
  welcomeCouponEnabled: false,
  welcomePercent: 10,
  welcomeMaxDiscount: 50000,
  welcomeMinOrder: 0,
  welcomeCouponDays: 7,
  welcomeMonthlyCap: 0,
};

/** الحقول التي يقرؤها المتصفح — كل شيء هنا عام (لا أسرار). */
export type PublicSettings = SiteSettingsData;

/**
 * الشارة «بقي X فقط»: تُعرض فقط عندما يتتبّع الأدمن الكمية (stockQty ليست null)،
 * وهي أقل من العتبة أو تساويها، وأكبر من صفر (الصفر = نفد).
 */
export function lowStockLabel(
  stockQty: number | null | undefined,
  threshold: number,
): string | null {
  if (stockQty == null || threshold <= 0 || stockQty <= 0 || stockQty > threshold) return null;
  if (stockQty === 1) return 'بقيت قطعة واحدة فقط';
  if (stockQty === 2) return 'بقيت قطعتان فقط';
  return `بقي ${stockQty} قطع فقط`;
}

/** المنتج قابل للطلب إذا كان متوفراً ولم تصل الكمية المتتبَّعة إلى الصفر. */
export function isAvailable(product: { inStock: boolean; stockQty?: number | null }): boolean {
  return product.inStock && product.stockQty !== 0;
}
