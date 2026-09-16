import { db } from '@/lib/db';
import { GLOSSARY_CATEGORIES } from '../../../../../prisma/seed-glossary';
import { GlossaryPanel } from './GlossaryPanel';

export const dynamic = 'force-dynamic';

export default async function AdminGlossaryPage() {
  const [entries, products] = await Promise.all([
    db.glossaryEntry.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      include: { products: { select: { id: true } } },
    }),
    db.product.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true },
    }),
  ]);
  const categories = [...new Set([...GLOSSARY_CATEGORIES, ...entries.map((e) => e.category)])];
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
      <GlossaryPanel
        categories={categories}
        products={products}
        entries={entries.map((e) => ({
          id: e.id,
          slug: e.slug,
          name: e.name,
          category: e.category,
          summary: e.summary,
          tip: e.tip,
          image: e.image,
          published: e.published,
          sortOrder: e.sortOrder,
          productIds: e.products.map((p) => p.id),
        }))}
      />
    </>
  );
}
