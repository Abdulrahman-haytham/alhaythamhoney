import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FlaskConical } from 'lucide-react';
import { getMixtures } from '@/lib/mixtures.server';
import { SITE } from '@/lib/config';

// Query at request time: production builds do not need a live database.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'الخلطات الخاصة',
  description:
    'خلطات نحل مصمّمة بخبرة نحّال: الملكية للحيوية، الخليّة الكاملة للمناعة، صباح الهيثم للفطور. اختر عسلك وعدّل المكوّنات واعرف السعر فوراً.',
  alternates: { canonical: '/custom-mixtures' },
  openGraph: {
    title: `الخلطات الخاصة | ${SITE.name}`,
    description: 'اختر عسلك، عدّل المكوّنات ضمن حدود الخبير، واعرف السعر فوراً.',
    url: `${SITE.url}/custom-mixtures`,
    type: 'website',
  },
};

export default async function MixturesPage() {
  const mixtures = await getMixtures();

  return (
    <section className="min-h-screen bg-zinc-950 px-4 pt-32 pb-16 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
            <FlaskConical className="h-7 w-7 text-amber-500" strokeWidth={1.5} />
          </div>
          <h1 className="mb-4 font-amiri text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            الخلطات الخاصة
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-400">
            وصفات ضبطها خبير النحل — تختار عسلك الأساسي وحجمك، وتعدّل المكوّنات إن شئت، والسعر يظهر
            أمامك فوراً.
          </p>
        </div>

        {mixtures.length === 0 ? (
          <p className="py-20 text-center text-zinc-500">لا توجد خلطات متاحة حالياً.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {mixtures.map((m) => (
              <Link
                key={m.id}
                href={`/custom-mixtures/${m.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 transition-colors hover:border-amber-500/40"
              >
                {m.image && (
                  <img
                    src={m.image}
                    alt={`خلطة ${m.name}`}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <p className="mb-1 text-xs font-bold tracking-wide text-amber-500">{m.tagline}</p>
                  <h2 className="mb-3 font-amiri text-2xl font-bold text-white group-hover:text-amber-300">
                    {m.name}
                  </h2>
                  <p className="mb-5 flex-1 text-sm leading-relaxed text-zinc-400">{m.desc}</p>
                  <ul className="mb-5 flex flex-wrap gap-1.5">
                    <li className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[11px] text-zinc-300">
                      عسل من اختيارك
                    </li>
                    {m.ingredients.map((i) => (
                      <li
                        key={i.id}
                        className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[11px] text-zinc-300"
                      >
                        {i.name}
                      </li>
                    ))}
                  </ul>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-amber-400">
                    صمّم خلطتك
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
