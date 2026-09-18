/**
 * طبقات خلية لانغستروث من السقف إلى المدخل — هندسة الرسم والترتيب ثابتان في الكود،
 * والارتفاعات تقريبية للعرض: الرقيقة منها مرفوعة قليلاً لتبقى قابلة للنقر باللمس،
 * والأسماء والشروح والصور تُقرأ من مداخل الموسوعة عبر الـ slugs.
 * خالص (بلا `'server-only'`) حتى يُستورد من العميل والاختبارات.
 */
export const HIVE_LAYERS = [
  {
    key: 'outer-cover',
    slug: 'outer-cover',
    position: 'السقف',
    /** ارتفاع الطبقة في وحدات الرسم (viewBox) */
    height: 20,
    kind: 'lid',
  },
  {
    key: 'inner-cover',
    slug: 'inner-cover',
    position: 'تحت السقف',
    height: 12,
    kind: 'board',
  },
  {
    key: 'honey-super',
    slug: 'honey-super',
    position: 'الطابق العلوي — مخزن العسل',
    height: 58,
    kind: 'box',
    /** ما بداخل الصندوق — مدخل الإطار الذي يُربط من لوحة الطبقة */
    framesSlug: 'wooden-bee-frame',
  },
  {
    key: 'queen-excluder',
    slug: 'queen-excluder-metal',
    position: 'بين الطابقين',
    height: 12,
    kind: 'grid',
  },
  {
    key: 'brood-box',
    slug: 'brood-box',
    position: 'الطابق السفلي — بيت الحضنة',
    height: 78,
    kind: 'box',
    framesSlug: 'wooden-frame-wax-foundation',
  },
  {
    key: 'bottom-board',
    slug: 'bottom-board',
    position: 'القاعدة',
    height: 14,
    kind: 'board',
  },
  {
    key: 'entrance-reducer',
    slug: 'entrance-reducer',
    position: 'المدخل',
    height: 14,
    kind: 'entrance',
  },
] as const;

export type HiveLayerKey = (typeof HIVE_LAYERS)[number]['key'];
export type HiveLayerKind = (typeof HIVE_LAYERS)[number]['kind'];
export type HiveLayer = (typeof HIVE_LAYERS)[number];

/** كل الـ slugs التي تحتاجها صفحة الخلية (الطبقات وإطاراتها) — لجلبها بطلب واحد. */
export const HIVE_SLUGS: readonly string[] = [
  ...new Set(HIVE_LAYERS.flatMap((l) => [l.slug, ...('framesSlug' in l ? [l.framesSlug] : [])])),
];
