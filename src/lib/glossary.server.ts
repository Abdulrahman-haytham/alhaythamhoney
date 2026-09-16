import 'server-only';
import { db } from '@/lib/db';
import { GLOSSARY_CATEGORIES } from '../../prisma/seed-glossary';

/** ترتيب التصنيفات المعروفة أولاً، ثم أي تصنيف جديد يضيفه الأدمن بعدها أبجدياً. */
export function orderCategories(categories: string[]): string[] {
  const known = GLOSSARY_CATEGORIES as readonly string[];
  const seen = [...new Set(categories)];
  return [
    ...known.filter((c) => seen.includes(c)),
    ...seen.filter((c) => !known.includes(c)).sort((a, b) => a.localeCompare(b, 'ar')),
  ];
}

const listSelect = {
  slug: true,
  name: true,
  category: true,
  summary: true,
  image: true,
  tip: true,
} as const;

export type GlossaryCard = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  image: string;
  /** هل لهذا المدخل نصيحة من النحّال — شارة في البطاقة بلا تحميل النص كاملاً */
  hasTip: boolean;
};

/** كل المداخل المنشورة — الفهرس صغير (عشرات) فيُرسَل كاملاً وتتم الفلترة في المتصفح. */
export async function getGlossaryCards(): Promise<GlossaryCard[]> {
  const rows = await db.glossaryEntry.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: listSelect,
  });
  return rows.map(({ tip, ...row }) => ({ ...row, hasTip: !!tip?.trim() }));
}

/** مدخل واحد مع منتجاته المرتبطة. المسودّات لا تُعاد إلا للأدمن. */
export async function getGlossaryEntry(slug: string, includeDrafts = false) {
  const entry = await db.glossaryEntry.findUnique({
    where: { slug },
    include: {
      products: {
        where: { published: true },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, slug: true, name: true, image: true, price: true, weight: true },
      },
    },
  });
  if (!entry || (!entry.published && !includeDrafts)) return null;
  return entry;
}

/** مداخل أخرى من التصنيف نفسه — «قد يهمّك أيضاً» في نهاية الصفحة. */
export async function getSiblingEntries(category: string, excludeSlug: string, take = 4) {
  return db.glossaryEntry.findMany({
    where: { published: true, category, slug: { not: excludeSlug } },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    take,
    select: { slug: true, name: true, image: true, category: true },
  });
}

/** مداخل الموسوعة المرتبطة بمنتج — تظهر في صفحة المنتج («من ورشتنا»). */
export async function getProductGlossary(productId: string, take = 4) {
  return db.glossaryEntry.findMany({
    where: { published: true, products: { some: { id: productId } } },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    take,
    select: { slug: true, name: true, image: true, category: true },
  });
}
