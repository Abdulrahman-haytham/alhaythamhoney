import type { Metadata } from 'next';
import { Camera } from 'lucide-react';
import { db } from '@/lib/db';
import { SITE } from '@/lib/config';

// Query at request time: production builds do not need a live database.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'استديو الهيثم',
  description:
    'لقطات من منحل الهيثم: تصوير المنتجات، خلايا النحل، وخلف الكواليس — من قمحانة، حماة.',
  alternates: { canonical: '/studio' },
  openGraph: {
    title: `استديو الهيثم | ${SITE.name}`,
    description: 'لقطات ومقاطع من منحل الهيثم وخلف الكواليس.',
    url: `${SITE.url}/studio`,
    type: 'website',
  },
};

export default async function StudioPage() {
  const media = await db.studioPhoto.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <section className="min-h-screen bg-zinc-950 px-4 pt-32 pb-16 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
            <Camera className="h-7 w-7 text-amber-500" strokeWidth={1.5} />
          </div>
          <h1 className="mb-4 font-amiri text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            استديو الهيثم
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            لقطات من المنحل: تصوير المنتجات، خلايا النحل، وخلف الكواليس.
          </p>
        </div>

        {media.length === 0 ? (
          <p className="py-20 text-center text-zinc-500">
            لا توجد لقطات بعد — ترقّبوا جديدنا قريباً.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((item) => (
              <figure
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 transition-colors hover:border-amber-500/40"
              >
                {item.type === 'VIDEO' ? (
                  <video
                    src={item.url}
                    controls
                    preload="metadata"
                    playsInline
                    className="aspect-square w-full bg-black object-cover"
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.caption ?? 'لقطة من استديو الهيثم'}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                {item.caption && (
                  <figcaption className="px-5 py-4 text-sm leading-relaxed text-zinc-300">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
