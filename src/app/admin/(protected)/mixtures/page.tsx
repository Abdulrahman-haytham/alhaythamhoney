import { db } from '@/lib/db';
import { MixturesPanel } from './MixturesPanel';

export const dynamic = 'force-dynamic';

export default async function AdminMixturesPage() {
  const mixtures = await db.mixture.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { ingredients: { orderBy: { sortOrder: 'asc' } } },
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-white">الخلطات الخاصة</h1>
      <p className="mb-8 text-sm text-zinc-500">
        اضبط سعر الغرام لكل مكوّن، وحدوده، والجرعة الموصى بها التي يراها الزبون افتراضياً. سعر العسل
        الأساسي يُحسب تلقائياً من سعر المنتج ووزنه.
      </p>
      <MixturesPanel
        mixtures={mixtures.map((m) => ({
          id: m.id,
          slug: m.slug,
          name: m.name,
          tagline: m.tagline,
          baseSize: m.baseSize,
          prepFee: m.prepFee,
          published: m.published,
          ingredients: m.ingredients.map((i) => ({
            id: i.id,
            name: i.name,
            note: i.note,
            pricePerGram: i.pricePerGram,
            minGrams: i.minGrams,
            maxGrams: i.maxGrams,
            recommended: i.recommended,
            step: i.step,
          })),
        }))}
      />
    </div>
  );
}
