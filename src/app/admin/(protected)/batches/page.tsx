import { db } from '@/lib/db';
import { toIsoDay } from '@/lib/articles';
import { BatchesPanel } from './BatchesPanel';

export const dynamic = 'force-dynamic';

export default async function AdminBatchesPage() {
  const [batches, products, studioVideos] = await Promise.all([
    db.batch.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true } },
        _count: { select: { jarCodes: true } },
      },
    }),
    db.product.findMany({
      where: { category: { not: 'BUNDLE' } },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true },
    }),
    db.studioPhoto.findMany({
      where: { type: 'VIDEO' },
      orderBy: { createdAt: 'desc' },
      select: { url: true, caption: true },
    }),
  ]);
  return (
    <>
      <h1 className="mb-3 font-amiri text-3xl font-bold">جوازات الدفعات</h1>
      <p className="mb-6 text-sm text-zinc-400">
        لكل قطاف دفعة: المنحل، التاريخ، المصدر الزهري، وتقرير المخبر. اطبع رابط الجواز{' '}
        <code className="text-amber-300">/batch/الرمز</code> أو اربط رموز المرطبانات بالدفعة من صفحة
        «السحب» فيفتح QR المرطبان (<code className="text-amber-300">/j/HY-…</code>) الجواز مباشرة.
      </p>
      <BatchesPanel
        products={products}
        videos={studioVideos}
        batches={batches.map((b) => ({
          id: b.id,
          code: b.code,
          title: b.title,
          productId: b.productId,
          productName: b.product?.name ?? null,
          region: b.region,
          harvestDate: b.harvestDate ? toIsoDay(b.harvestDate) : null,
          floralSource: b.floralSource,
          moisture: b.moisture,
          labReportUrl: b.labReportUrl,
          videoUrl: b.videoUrl,
          notes: b.notes,
          published: b.published,
          jarCodes: b._count.jarCodes,
        }))}
      />
    </>
  );
}
