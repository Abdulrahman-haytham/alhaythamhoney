/**
 * مساعدات موسوعة النحّال الخالصة — بلا `'server-only'` وبلا استيراد بيانات البذرة،
 * حتى تُستورد بأمان من مكوّنات العميل ومن الاختبارات على السواء.
 */
import {
  BookOpen,
  Bug,
  Crown,
  Droplets,
  Flame,
  FlaskConical,
  Hexagon,
  Leaf,
  Package,
  Scale,
  Shield,
  Sprout,
  Sun,
  Thermometer,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

/** مفاتيح الأيقونات المتاحة لكل مرحلة — قائمة ثابتة، توسيعها يحتاج تعديل الكود. */
export const GLOSSARY_ICON_KEYS = [
  'hexagon',
  'wrench',
  'crown',
  'shield',
  'droplets',
  'flame',
  'package',
  'flask',
  'leaf',
  'scale',
  'bug',
  'sprout',
  'sun',
  'thermometer',
] as const;

export type GlossaryIconKey = (typeof GLOSSARY_ICON_KEYS)[number];

export const GLOSSARY_ICON_LABELS: Record<GlossaryIconKey, string> = {
  hexagon: 'خلية',
  wrench: 'أداة',
  crown: 'ملكة',
  shield: 'حماية',
  droplets: 'عسل',
  flame: 'شمع',
  package: 'صندوق',
  flask: 'فحص',
  leaf: 'زهرة',
  scale: 'ميزان',
  bug: 'حشرة',
  sprout: 'نمو',
  sun: 'شمس',
  thermometer: 'حرارة',
};

const GLOSSARY_ICON_COMPONENTS: Record<GlossaryIconKey, LucideIcon> = {
  hexagon: Hexagon,
  wrench: Wrench,
  crown: Crown,
  shield: Shield,
  droplets: Droplets,
  flame: Flame,
  package: Package,
  flask: FlaskConical,
  leaf: Leaf,
  scale: Scale,
  bug: Bug,
  sprout: Sprout,
  sun: Sun,
  thermometer: Thermometer,
};

export function isGlossaryIconKey(value: string | null | undefined): value is GlossaryIconKey {
  return !!value && (GLOSSARY_ICON_KEYS as readonly string[]).includes(value);
}

/** أيقونة المرحلة أو BookOpen الافتراضية — مكوّن جاهز للاستخدام المباشر. */
export function glossaryIconComponent(icon: string | null | undefined): LucideIcon {
  return isGlossaryIconKey(icon) ? GLOSSARY_ICON_COMPONENTS[icon] : BookOpen;
}

/** يحوّل رقماً إلى أرقام هندية عربية (١٢٣) — للزخرفة فقط؛ العدّادات تبقى لاتينية كموقع. */
export function toArabicIndic(n: number): string {
  const digits = '٠١٢٣٤٥٦٧٨٩';
  return String(n).replace(/\d/g, (d) => digits[+d]);
}

/**
 * يفصل نصاً حراً (فاصلة عربية أو إنجليزية أو سطر جديد) إلى قائمة مقصوصة بلا تكرار.
 * يُستخدم في محرّر اللوحة لتحويل ما يكتبه الأدمن إلى مصفوفة قبل الإرسال.
 */
export function parseAliases(raw: string): string[] {
  const parts = raw
    .split(/[،,\n]/)
    .map((p) => p.trim())
    .filter(Boolean);
  return [...new Set(parts)];
}

/** يفصل نصاً على الأسطر — للمصادر والمراجع (سطر واحد لكل مصدر). */
export function parseLines(raw: string): string[] {
  const parts = raw
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);
  return [...new Set(parts)];
}

/** تطبيع عربي بسيط: يتجاهل التشكيل واختلاف الألف والهمزة والتاء المربوطة. */
export function normalizeArabic(s: string): string {
  return s
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase();
}

/** ترتيب التصنيفات: المرتّبة صراحةً (من القاعدة أو البذرة) أولاً بترتيبها، ثم أي اسم مجهول أبجدياً عربياً. */
export function orderCategories(categories: string[], ranked: readonly string[]): string[] {
  const seen = [...new Set(categories)];
  // القائمة المرتّبة قد تجمع أسماء القاعدة وأسماء البذرة معاً — تكرارها لا يجوز أن يكرّر المرحلة
  const rank = [...new Set(ranked)];
  return [
    ...rank.filter((c) => seen.includes(c)),
    ...seen.filter((c) => !rank.includes(c)).sort((a, b) => a.localeCompare(b, 'ar')),
  ];
}

export type GlossaryCard = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  image: string;
  aliases: string[];
  /** هل لهذا المدخل نصيحة من النحّال — شارة في البطاقة بلا تحميل النص كاملاً */
  hasTip: boolean;
};

export type GlossaryCategoryMeta = {
  name: string;
  intro: string | null;
  icon: string | null;
};

export type GlossaryStageMeta = {
  /** معرّف القسم في الصفحة — `stage-1`, `stage-2`, … */
  id: string;
  /** رقم المرحلة بدءاً من ١ */
  index: number;
  name: string;
  intro: string | null;
  icon: GlossaryIconKey | null;
  count: number;
};

export type GlossaryStage = GlossaryStageMeta & { entries: GlossaryCard[] };

/**
 * يجمّع المداخل في مراحل مرتّبة حسب `orderCategories`. تصنيف بلا مداخل منشورة يُتجاهل،
 * وأيقونة خارج القائمة الثابتة تصبح null بدل أن تكسر العرض.
 */
export function groupByStage(
  entries: GlossaryCard[],
  categories: GlossaryCategoryMeta[],
  fallbackOrder: readonly string[] = [],
): GlossaryStage[] {
  const metaByName = new Map(categories.map((c) => [c.name, c]));
  const ranked = [...categories.map((c) => c.name), ...fallbackOrder];
  const names = orderCategories(
    entries.map((e) => e.category),
    ranked,
  );

  return names
    .map((name, i) => {
      const stageEntries = entries.filter((e) => e.category === name);
      if (stageEntries.length === 0) return null;
      const meta = metaByName.get(name);
      return {
        id: `stage-${i + 1}`,
        index: i + 1,
        name,
        intro: meta?.intro ?? null,
        icon: isGlossaryIconKey(meta?.icon) ? meta.icon : null,
        count: stageEntries.length,
        entries: stageEntries,
      };
    })
    .filter((s): s is GlossaryStage => s !== null)
    .map((s, i) => ({ ...s, index: i + 1, id: `stage-${i + 1}` }));
}

/** مدخل تمثيلي واحد لكل مرحلة — لتشويق الرئيسية. أقل من 3 مراحل = لا تشويق. */
export function journeyPreview(
  stages: GlossaryStage[],
  limit = 6,
): { index: number; name: string; icon: GlossaryIconKey | null; entry: GlossaryCard }[] {
  if (stages.length < 3) return [];
  return stages.slice(0, limit).map((s) => ({
    index: s.index,
    name: s.name,
    icon: s.icon,
    entry: s.entries[0],
  }));
}
