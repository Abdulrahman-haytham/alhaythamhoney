import 'server-only';
import { db } from '@/lib/db';
import { defaultVariant, variantAvailable } from '@/lib/variants';
import { renderMarkdown, stripHtml } from '@/lib/markdown';

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  /** مسار صورة الغلاف (اختياري). */
  image: string | null;
  /** تاريخ النشر بصيغة ISO (YYYY-MM-DD). */
  publishedAt: string;
  published: boolean;
  readingMinutes: number;
}

export interface Article extends ArticleMeta {
  /** جسم المقال بعد تحويله من Markdown إلى HTML مُعقَّم. */
  html: string;
  /** المنتجات التي ربطها الأدمن بالمقال (المنشورة فقط) */
  products: ArticleProduct[];
}

export interface ArticleProduct {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number | null;
  weight: string | null;
  inStock: boolean;
  stockQty: number | null;
  /** المتغيّر الافتراضي (إن وُجدت أحجام) — يُضاف من البطاقة مباشرة */
  variantId: string | null;
  variantLabel: string | null;
}

const WORDS_PER_MINUTE = 200;

const dateFormatter = new Intl.DateTimeFormat('ar-SY', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

/** يحوّل تاريخاً إلى ISO يوم فقط (YYYY-MM-DD). */
export function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

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
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

type Row = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  image: string | null;
  body: string;
  published: boolean;
  publishedAt: Date;
};

function toMeta(row: Row): ArticleMeta {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    keywords: row.keywords,
    image: row.image,
    publishedAt: toIsoDay(row.publishedAt),
    published: row.published,
    readingMinutes: estimateReadingMinutes(row.body),
  };
}

/** المقالات المنشورة (بيانات وصفية + زمن القراءة) — الأحدث أولاً. */
export async function getAllArticles(): Promise<ArticleMeta[]> {
  const rows = await db.article.findMany({
    where: { published: true, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: 'desc' },
  });
  return rows.map(toMeta);
}

/**
 * مقال واحد مع جسمه المُصيَّر. المسودّات والمقالات المجدولة لا تُعاد إلا مع
 * `includeDrafts` (للأدمن أثناء المعاينة).
 */
export async function getArticleBySlug(
  slug: string,
  includeDrafts = false,
): Promise<Article | null> {
  const row = await db.article.findUnique({
    where: { slug },
    include: {
      products: {
        where: { published: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          slug: true,
          name: true,
          image: true,
          price: true,
          weight: true,
          inStock: true,
          stockQty: true,
          variants: { orderBy: { sortOrder: 'asc' } },
        },
      },
    },
  });
  if (!row) return null;
  const live = row.published && row.publishedAt <= new Date();
  if (!live && !includeDrafts) return null;
  return {
    ...toMeta(row),
    html: renderMarkdown(row.body),
    products: row.products.map(({ variants, ...p }) => {
      const variant = defaultVariant(variants);
      return {
        ...p,
        price: variant ? variant.price : p.price,
        weight: variant ? variant.label : p.weight,
        stockQty: variant ? variant.stockQty : p.stockQty,
        inStock: p.inStock && (!variant || variantAvailable(variant)),
        variantId: variant?.id ?? null,
        variantLabel: variant?.label ?? null,
      };
    }),
  };
}
