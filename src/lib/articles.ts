import 'server-only';
import { readFile } from 'fs/promises';
import path from 'path';

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  /** مسار صورة الغلاف (اختياري). */
  image?: string;
  /** تاريخ النشر بصيغة ISO (YYYY-MM-DD). */
  publishedAt: string;
}

export interface Article extends ArticleMeta {
  /** جسم المقال — HTML خام من ملف المحتوى في `content/articles`. */
  html: string;
  readingMinutes: number;
}

/**
 * بيانات المقالات (بدون الجسم). الجسم يُقرأ من القرص عند الطلب عبر `getArticleBySlug`.
 * ملاحظة: `publishedAt` لم يكن موجوداً في البيانات القديمة، فوُزّعت التواريخ شهرياً
 * من حزيران 2025 حتى شباط 2026 (دليل رمضان قبيل رمضان 2026).
 */
const ARTICLES: ArticleMeta[] = [
  {
    slug: 'black-seed-honey-benefits',
    title: 'فوائد عسل حبة البركة الصحية',
    description:
      'اكتشف الفوائد الصحية المذهلة لعسل حبة البركة الطبيعي 100%، ودوره في دعم المناعة والصحة العامة.',
    keywords: ['عسل حبة البركة', 'فوائد العسل', 'دعم المناعة', 'عسل طبيعي', 'عسل نحل حبة البركة'],
    publishedAt: '2025-06-09',
  },
  {
    slug: 'how-to-identify-natural-honey',
    title: 'كيف تميّز العسل الطبيعي من المغشوش؟',
    description:
      'دليل شامل لتمييز العسل الطبيعي الأصيل من العسل المغشوش أو الصناعي، مع التركيز على الثقة والفحص المخبري.',
    keywords: [
      'تمييز العسل',
      'عسل طبيعي',
      'كشف غش العسل',
      'جودة العسل',
      'عسل مغشوش',
      'ثقة في العسل',
    ],
    publishedAt: '2025-07-14',
  },
  {
    slug: 'honey-crystallization',
    title: 'هل تبلور العسل دليل على الجودة والنقاء؟',
    description:
      'تعرف على حقيقة تبلور العسل ولماذا يعتبر علامة على العسل الطبيعي الأصلي، وكيف يؤثر على الفوائد الصحية.',
    keywords: ['تبلور العسل', 'عسل متبلور', 'جودة العسل', 'عسل طبيعي', 'عسل نقي', 'فوائد العسل'],
    publishedAt: '2025-08-11',
  },
  {
    slug: 'honey-for-children-cough',
    title: 'العسل الطبيعي لعلاج السعال عند الأطفال بأمان',
    description:
      'اكتشف كيف يساعد العسل الطبيعي على تهدئة السعال عند الأطفال بأمان، مع نصائح الجرعات الصحيحة والاحتياطات اللازمة.',
    keywords: [
      'عسل للأطفال',
      'علاج السعال',
      'عسل طبيعي',
      'صحة الأطفال',
      'عسل نقي',
      'العلاج الطبيعي للسعال',
    ],
    publishedAt: '2025-09-15',
  },
  {
    slug: 'honey-royal-jelly-sexual-health',
    title: 'العسل وغذاء ملكات النحل: تعزيز الصحة الجنسية',
    description:
      'اكتشف فوائد العسل وغذاء ملكات النحل في دعم الصحة الجنسية والطاقة الطبيعية، مع نصائح آمنة وطبيعية.',
    keywords: [
      'عسل طبيعي',
      'غذاء ملكات النحل',
      'الصحة الجنسية',
      'تعزيز الطاقة',
      'حيوية الجسم',
      'عسل وصحة',
    ],
    publishedAt: '2025-10-13',
  },
  {
    slug: 'honey-for-stomach-and-colon',
    title: 'العسل لعلاج جرثومة المعدة ومشاكل القولون',
    description:
      'تعرف على الوصفة الذهبية لاستخدام العسل في علاج جرثومة المعدة، الحموضة، وتهيج القولون العصبي بشكل طبيعي.',
    keywords: [
      'علاج جرثومة المعدة',
      'عسل للقولون',
      'علاج الحموضة',
      'عسل طبيعي',
      'المعدة',
      'الجهاز الهضمي',
    ],
    publishedAt: '2025-11-10',
  },
  {
    slug: 'secrets-of-bees-kingdom',
    title: 'أسرار مملكة النحل: مجتمع هندسي مدهش يفوق الخيال',
    description:
      'تعرف على خفايا عالم النحل ونظامه الاجتماعي الرائع، كيف يعمل هذا المجتمع بترتيب دقيق لإنتاج العسل وتلقيح النباتات، وما الذي يجعله من أذكى الكائنات في الطبيعة.',
    keywords: [
      'عالم النحل',
      'ملكة النحل',
      'تربية النحل',
      'خلايا النحل',
      'معلومات عن النحل',
      'هندسة الطبيعة',
      'النحل والعسل',
    ],
    publishedAt: '2025-12-08',
  },
  {
    slug: 'best-honey-types-in-syria-guide',
    title: 'دليل أفضل أنواع العسل في سوريا: خصائصها وكيف تختار الأنسب لك',
    description:
      'دليل شامل من مؤسسة الهيثم — نحل وعسل حول أفضل أنواع العسل في سوريا، خصائصها (حبة البركة، الجبلي، الزعتر، الشوكيات)، وكيف تختار الأنسب لصحتك وذوقك.',
    keywords: [
      'أفضل عسل في سوريا',
      'أنواع العسل السوري',
      'عسل حبة البركة',
      'عسل جبلي',
      'عسل شوكيات',
      'عسل الهيثم',
      'شراء عسل أصلي',
      'عسل الزعتر',
      'عسل الحمضيات',
    ],
    publishedAt: '2026-01-12',
  },
  {
    slug: 'honey-in-ramadan-guide',
    title: 'العسل في رمضان: طاقة نقية لصيام متوازن وصحة أقوى',
    description:
      'تعرف على لماذا يُعد العسل الغذاء الأمثل للصائم، وكيف يساعد في طاقة السحور، توازن سكر الدم، ودعم الهضم والمناعة خلال شهر رمضان.',
    keywords: [
      'العسل في رمضان',
      'سحور صحي',
      'طاقة الصيام',
      'فوائد العسل',
      'صيام متوازن',
      'غذاء الصائم',
    ],
    publishedAt: '2026-02-09',
  },
];

const CONTENT_DIR = path.join(process.cwd(), 'content', 'articles');
const WORDS_PER_MINUTE = 200;

const dateFormatter = new Intl.DateTimeFormat('ar-SY', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

/** يعرض تاريخ ISO (YYYY-MM-DD) بصيغة عربية مقروءة. */
export function formatArticleDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}

/** يعرض زمن القراءة بصيغة عربية سليمة (دقيقة / دقيقتان / دقائق). */
export function formatReadingTime(minutes: number): string {
  if (minutes === 1) return 'دقيقة واحدة للقراءة';
  if (minutes === 2) return 'دقيقتان للقراءة';
  if (minutes <= 10) return `${minutes} دقائق للقراءة`;
  return `${minutes} دقيقة للقراءة`;
}

/** تقدير زمن القراءة بالدقائق من نص HTML (بعد إزالة الوسوم). */
export function estimateReadingMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function byNewest(a: ArticleMeta, b: ArticleMeta) {
  return b.publishedAt.localeCompare(a.publishedAt);
}

/** كل المقالات (بيانات وصفية فقط، بدون الجسم) — الأحدث أولاً. */
export function getAllArticles(): ArticleMeta[] {
  return [...ARTICLES].sort(byNewest);
}

async function readArticleHtml(slug: string): Promise<string> {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  return (await readFile(filePath, 'utf8')).trim();
}

/** مقال واحد مع جسمه (HTML). يعيد null إن لم يُعرف الـ slug أو غاب ملف المحتوى. */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const meta = ARTICLES.find((a) => a.slug === slug);
  if (!meta) return null;

  try {
    const html = await readArticleHtml(meta.slug);
    return { ...meta, html, readingMinutes: estimateReadingMinutes(html) };
  } catch {
    return null;
  }
}

/** كل المقالات مع زمن القراءة (يقرأ الملفات لتقدير الزمن) — الأحدث أولاً. */
export async function getAllArticlesWithReadingTime(): Promise<
  (ArticleMeta & { readingMinutes: number })[]
> {
  const list = await Promise.all(
    getAllArticles().map(async (meta) => {
      let readingMinutes = 1;
      try {
        readingMinutes = estimateReadingMinutes(await readArticleHtml(meta.slug));
      } catch {
        // إن غاب الملف نُبقي القيمة الافتراضية ولا نُسقط الصفحة كلها.
      }
      return { ...meta, readingMinutes };
    }),
  );
  return list;
}
