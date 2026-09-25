/**
 * مصدر الحقيقة الوحيد لبيانات النشاط وأرقامه.
 * كل ما يظهر للزائر أو في ترميز Schema.org يقرأ من هنا — لا أرقام مكتوبة في المكوّنات،
 * حتى لا يتناقض الموقع مع نفسه ولا يبقى رقم قديم في زاوية منسية.
 */

export const FOUNDED_YEAR = 1997;

/** سنوات الخبرة تُحسب ولا تُكتب: الرقم الثابت يشيخ بصمت كل كانون الثاني. */
export function yearsOfExperience(now = new Date()): number {
  return now.getFullYear() - FOUNDED_YEAR;
}

export const BUSINESS = {
  name: 'الهيثم — نحل وعسل',
  alternateNames: ['الهيثم نحل وعسل', 'عسل الهيثم', 'مناحل الهيثم', 'Al-Haytham Honey'],
  foundedYear: FOUNDED_YEAR,
  address: {
    street: 'الحي الشمالي، جانب مسجد بلال الحبشي',
    locality: 'قمحانة',
    region: 'حماة',
    country: 'SY',
    countryName: 'سوريا',
  },
  /** إحداثيات المنحل — تؤكَّد من المالك قبل أي اعتماد عليها في الخرائط */
  geo: { latitude: 35.2118, longitude: 36.7145 },
  openingHours: { opens: '09:00', closes: '21:00' },
  paymentAccepted: 'الدفع عند الاستلام',
  shippingArea: 'كل المحافظات السورية',
} as const;

/**
 * الأرقام المعروضة للزائر. كل رقم هنا يجب أن يكون قابلاً للإثبات —
 * ما لا يملك المالك دليلاً عليه يُترك `null` فيختفي من الواجهة بدل أن يُختلق.
 */
export const STATS = {
  /** عدد الخلايا — مؤكَّد من المالك */
  hives: 400 as number | null,
  /** عدد الزبائن — لم يُؤكَّد بعد، فلا يُعرض */
  customers: null as number | null,
} as const;
