import { db } from '@/lib/db';
import { AttributesPanel } from './AttributesPanel';

export const dynamic = 'force-dynamic';

export default async function AdminAttributesPage() {
  const attributes = await db.attribute.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      values: {
        orderBy: { sortOrder: 'asc' },
        select: { id: true, value: true, _count: { select: { products: true } } },
      },
    },
  });
  return (
    <>
      <h1 className="mb-3 font-amiri text-3xl font-bold">خصائص الفلترة</h1>
      <p className="mb-6 text-sm text-zinc-400">
        خصائص مثل «نوع الزهرة» و«المنطقة» و«الموسم» وقيمها. تُسند لكل منتج من محرّره، وتظهر للزائر
        كفلاتر في المتجر (تُخفى القيم التي لا منتجات لها). تعديل اسم قيمة يحذفها ويُنشئها من جديد —
        أعد ربط منتجاتها بعده.
      </p>
      <AttributesPanel
        attributes={attributes.map((a) => ({
          id: a.id,
          name: a.name,
          sortOrder: a.sortOrder,
          values: a.values.map((v) => ({ id: v.id, value: v.value, products: v._count.products })),
        }))}
      />
    </>
  );
}
