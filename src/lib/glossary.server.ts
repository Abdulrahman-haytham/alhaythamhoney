import 'server-only';
import { db } from '@/lib/db';
import { GLOSSARY_CATEGORIES } from '../../prisma/seed-glossary';
import {
  groupByStage,
  journeyPreview,
  orderCategories as orderCategoriesPure,
  type GlossaryCard,
  type GlossaryIconKey,
  type GlossaryStage,
  isGlossaryIconKey,
} from '@/lib/glossary';

export type { GlossaryCard, GlossaryStage, GlossaryStageMeta } from '@/lib/glossary';

/** ترتيب التصنيفات المعروفة أولاً (بترتيب البذرة)، ثم أي تصنيف جديد يضيفه الأدمن أبجدياً. */
export function orderCategories(categories: string[]): string[] {
  return orderCategoriesPure(categories, GLOSSARY_CATEGORIES);
}

const listSelect = {
  slug: true,
  name: true,
  category: true,
  summary: true,
  image: true,
  tip: true,
  aliases: true,
} as const;

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

/** بيانات عرض كل التصنيفات (مقدّمة، أيقونة، ترتيب) — تُدار من `/admin/glossary`. */
export async function getGlossaryCategories() {
  return db.glossaryCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, intro: true, icon: true, sortOrder: true },
  });
}

/** الموسوعة كاملة مجمّعة في مراحل — المصدر الوحيد لصفحة `/beekeeping` وتشويق الرئيسية. */
export async function getGlossaryStages(): Promise<GlossaryStage[]> {
  const [entries, categories] = await Promise.all([getGlossaryCards(), getGlossaryCategories()]);
  return groupByStage(entries, categories, GLOSSARY_CATEGORIES);
}

/** مدخل تمثيلي واحد من أول 6 مراحل — لقسم التشويق في الرئيسية. */
export async function getGlossaryJourneyPreview(limit = 6) {
  return journeyPreview(await getGlossaryStages(), limit);
}

export interface GlossaryStageContext {
  id: string;
  index: number;
  total: number;
  name: string;
  intro: string | null;
  icon: GlossaryIconKey | null;
  prev: { slug: string; name: string; image: string } | null;
  next: { slug: string; name: string; image: string } | null;
}

/** موضع مدخل داخل مرحلته: رقمها من إجمالي المراحل، وجاراه السابق والتالي في المرحلة نفسها. */
export async function getStageContext(
  category: string,
  slug: string,
): Promise<GlossaryStageContext | null> {
  const stages = await getGlossaryStages();
  const stage = stages.find((s) => s.name === category);
  if (!stage) return null;
  const pos = stage.entries.findIndex((e) => e.slug === slug);
  const prev = pos > 0 ? stage.entries[pos - 1] : null;
  const next = pos >= 0 && pos < stage.entries.length - 1 ? stage.entries[pos + 1] : null;
  return {
    id: stage.id,
    index: stage.index,
    total: stages.length,
    name: stage.name,
    intro: stage.intro,
    icon: isGlossaryIconKey(stage.icon) ? stage.icon : null,
    prev: prev ? { slug: prev.slug, name: prev.name, image: prev.image } : null,
    next: next ? { slug: next.slug, name: next.name, image: next.image } : null,
  };
}

export type GlossaryLookup = GlossaryCard & { summary: string };

/**
 * مداخل منشورة بحسب slugs — للخلية التفاعلية ورحلة القطاف اللتين تعرفان أدواتهما بالكود.
 * تُعاد خريطة slug → مدخل؛ ما ليس منشوراً يغيب منها فتتخطاه الصفحة بلا كسر.
 */
export async function getEntriesBySlugs(slugs: readonly string[]) {
  const rows = await db.glossaryEntry.findMany({
    where: { published: true, slug: { in: [...slugs] } },
    select: listSelect,
  });
  return new Map(rows.map(({ tip, ...row }) => [row.slug, { ...row, hasTip: !!tip?.trim() }]));
}
