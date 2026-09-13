import { db } from '@/lib/db';
import { toIsoDay } from '@/lib/articles';
import { DrawsPanel } from './DrawsPanel';
import { JarCodesPanel } from './JarCodesPanel';

export const dynamic = 'force-dynamic';

export default async function AdminDrawsPage() {
  const [draws, batches, unused] = await Promise.all([
    db.draw.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { entries: true } },
        winnerEntry: {
          include: {
            customer: { select: { name: true, phone: true, email: true, city: true } },
            jarCode: { select: { code: true } },
          },
        },
      },
    }),
    db.jarCode.groupBy({
      by: ['batch'],
      _count: { _all: true },
      orderBy: { batch: 'asc' },
    }),
    db.jarCode.groupBy({ by: ['batch'], where: { usedAt: null }, _count: { _all: true } }),
  ]);
  const unusedByBatch = Object.fromEntries(unused.map((u) => [u.batch, u._count._all]));

  return (
    <>
      <h1 className="mb-1 font-amiri text-3xl font-bold">السحب الأسبوعي</h1>
      <p className="mb-8 text-sm text-zinc-400">
        ولّد رموزاً واطبعها على ملصقات المرطبانات، ثم افتح سحباً بتاريخين وجائزة. الزبون المسجّل
        يُدخل رمز مرطبانه ليشارك، وعند انتهاء المدة تضغط «اسحب الفائز» فيُختار عشوائياً وتظهر
        بياناته هنا لتتواصل معه.
      </p>
      <JarCodesPanel
        batches={batches.map((b) => ({
          batch: b.batch,
          total: b._count._all,
          unused: unusedByBatch[b.batch] ?? 0,
        }))}
      />
      <DrawsPanel
        draws={draws.map((d) => ({
          id: d.id,
          title: d.title,
          prize: d.prize,
          description: d.description,
          startsAt: toIsoDay(d.startsAt),
          endsAt: toIsoDay(d.endsAt),
          status: d.status,
          maxEntries: d.maxEntries,
          entries: d._count.entries,
          winner: d.winnerEntry
            ? { ...d.winnerEntry.customer, code: d.winnerEntry.jarCode.code }
            : null,
        }))}
      />
    </>
  );
}
