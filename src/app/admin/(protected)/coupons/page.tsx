import { db } from '@/lib/db';
import { toIsoDay } from '@/lib/articles';
import { CouponsPanel } from './CouponsPanel';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <>
      <h1 className="mb-1 font-amiri text-3xl font-bold">كوبونات الخصم</h1>
      <p className="mb-6 text-sm text-zinc-400">
        يكتب الزبون الكود في السلة فيُخصم فوراً ويصلك ضمن رسالة واتساب. لا عدّاد استخدام لأن الطلب
        يُتمّ خارج الموقع — عطّل الكوبون يدوياً أو حدّد له تاريخ انتهاء.
      </p>
      <CouponsPanel
        coupons={coupons.map((c) => ({
          id: c.id,
          code: c.code,
          type: c.type,
          value: c.value,
          minOrder: c.minOrder,
          maxDiscount: c.maxDiscount,
          active: c.active,
          startsAt: c.startsAt ? toIsoDay(c.startsAt) : null,
          expiresAt: c.expiresAt ? toIsoDay(c.expiresAt) : null,
          note: c.note,
        }))}
      />
    </>
  );
}
