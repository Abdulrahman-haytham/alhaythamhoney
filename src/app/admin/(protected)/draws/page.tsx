import { db } from '@/lib/db';
import { toIsoDay } from '@/lib/articles';
import { DrawsPanel } from './DrawsPanel';
import { JarCodesPanel } from './JarCodesPanel';

export const dynamic = 'force-dynamic';

export default async function AdminDrawsPage() {
  const [draws, batches, unused, passports, linked] = await Promise.all([
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
    db.batch.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, code: true, title: true },
    }),
    // جواز كل دفعة طباعة (إن رُبطت): أول رمز فيها يكفي
    db.jarCode.findMany({
      where: { batchId: { not: null } },
      distinct: ['batch'],
      select: { batch: true, passport: { select: { code: true } } },
    }),
  ]);
  const unusedByBatch = Object.fromEntries(unused.map((u) => [u.batch, u._count._all]));
  const passportByBatch = Object.fromEntries(
    linked.map((l) => [l.batch, l.passport?.code ?? null]),
  );

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
          passport: passportByBatch[b.batch] ?? null,
        }))}
        passports={passports}
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
