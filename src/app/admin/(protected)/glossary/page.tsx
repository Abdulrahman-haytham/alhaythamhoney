import { db } from '@/lib/db';
import { orderCategories } from '@/lib/glossary.server';
import { GlossaryPanel } from './GlossaryPanel';
import { StagesPanel } from './StagesPanel';

export const dynamic = 'force-dynamic';

export default async function AdminGlossaryPage() {
  const [entries, stageRows, products] = await Promise.all([
    db.glossaryEntry.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { products: { select: { id: true } } },
    }),
    db.glossaryCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, intro: true, icon: true, sortOrder: true },
    }),
    db.product.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  // أسماء المراحل من القاعدة أولاً بترتيبها، ثم أي تصنيف كتبه الأدمن حرّاً ولم يُسجَّل بعد
  const categories = orderCategories([
    ...stageRows.map((s) => s.name),
    ...entries.map((e) => e.category),
  ]);
  const rank = new Map(categories.map((c, i) => [c, i]));
  const usage = new Map<string, number>();
  for (const e of entries) usage.set(e.category, (usage.get(e.category) ?? 0) + 1);
  const withTip = entries.filter((e) => e.tip?.trim()).length;

  return (
    <>
      <h1 className="mb-3 font-amiri text-3xl font-bold">موسوعة النحّال</h1>
      <p className="mb-6 text-sm text-zinc-400">
        محتوى تعليمي يظهر في <code className="text-amber-300">/beekeeping</code> — لا سعر ولا شراء.
        كل مدخل له صفحته ورابطه في غوغل، فكل إضافة هنا باب جديد يدخل منه زائر.{' '}
        <b className="text-white">
          «نصيحة الهيثم» مكتوبة في {withTip} من {entries.length} مدخلاً
        </b>{' '}
        — وهي أهم حقل: نصيحتك من خبرتك هي ما لا يستطيع أي موقع آخر نسخه.
      </p>

      <section className="mb-10">
        <h2 className="mb-1 font-amiri text-2xl font-bold">المراحل</h2>
        <p className="mb-4 text-xs text-zinc-500">
          الزائر يقرأ الموسوعة كرحلة مرقّمة بهذا الترتيب. المقدّمة تظهر تحت عنوان كل مرحلة،
          والأيقونة في شريط التنقّل. المرحلة بلا مداخل منشورة لا تظهر للزوار.
        </p>
        <StagesPanel
          stages={[
            ...stageRows,
            // تصنيفات كُتبت في المدخل قبل أن يكون لها صفّ مرحلة — تظهر هنا لتُضبط أيقونتها ومقدّمتها
            ...categories
              .filter((c) => !stageRows.some((s) => s.name === c))
              .map((name, i) => ({
                id: null,
                name,
                intro: null,
                icon: null,
                sortOrder: stageRows.length + i,
              })),
          ]
            .map((s) => ({ ...s, used: usage.get(s.name) ?? 0 }))
            .sort((a, b) => (rank.get(a.name) ?? 999) - (rank.get(b.name) ?? 999))}
        />
      </section>

      <h2 className="mb-1 font-amiri text-2xl font-bold">المداخل</h2>
      <GlossaryPanel
        categories={categories}
        products={products}
        entries={entries
          .map((e) => ({
            id: e.id,
            slug: e.slug,
            name: e.name,
            category: e.category,
            summary: e.summary,
            tip: e.tip,
            image: e.image,
            published: e.published,
            sortOrder: e.sortOrder,
            aliases: e.aliases,
            sources: e.sources,
            productIds: e.products.map((p) => p.id),
          }))
          .sort((a, b) => (rank.get(a.category) ?? 999) - (rank.get(b.category) ?? 999))}
      />
    </>
  );
}
