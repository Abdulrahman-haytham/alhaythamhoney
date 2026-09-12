import { db } from '@/lib/db';
import { StudioPanel } from './StudioPanel';

export const dynamic = 'force-dynamic';

export default async function StudioPage() {
  const photos = await db.studioPhoto.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-white">استديو الهيثم</h1>
      <p className="mb-6 text-sm text-zinc-500">
        ارفع الصور ومقاطع الفيديو (تصوير المنتجات، خلف الكواليس...) — تُنشر مباشرة للزوار على{' '}
        <a href="/studio" target="_blank" className="text-amber-500 hover:text-amber-400">
          صفحة الاستديو
        </a>
        .
      </p>
      <StudioPanel
        initialPhotos={photos.map((p) => ({
          id: p.id,
          url: p.url,
          caption: p.caption,
          type: p.type,
          createdAt: p.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
