import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { getMixtureBySlug, getHoneyOptions } from '@/lib/mixtures.server';
import { MixtureBuilder } from '@/components/MixtureBuilder';
import { SITE } from '@/lib/config';

// Query at request time: production builds do not need a live database.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mixture = await getMixtureBySlug(slug);
  if (!mixture || !mixture.published) notFound();
  return {
    title: `خلطة ${mixture.name} — ${mixture.tagline}`,
    description: mixture.desc,
    alternates: { canonical: `/custom-mixtures/${mixture.slug}` },
    openGraph: {
      title: `خلطة ${mixture.name} | ${SITE.name}`,
      description: mixture.desc,
      url: `${SITE.url}/custom-mixtures/${mixture.slug}`,
      type: 'website',
      ...(mixture.image ? { images: [{ url: mixture.image }] } : {}),
    },
  };
}

export default async function MixturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [mixture, honeys] = await Promise.all([getMixtureBySlug(slug), getHoneyOptions()]);
  if (!mixture || !mixture.published) notFound();

  return (
    <section className="min-h-screen bg-zinc-950 px-4 pt-28 pb-16 sm:px-6 sm:pt-32">
      <div className="container mx-auto max-w-5xl">
        <Link
          href="/custom-mixtures"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-amber-400"
        >
          <ArrowRight className="h-4 w-4" />
          كل الخلطات
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <aside className="lg:col-span-2">
            <p className="mb-2 text-xs font-bold tracking-wide text-amber-500">{mixture.tagline}</p>
            <h1 className="mb-4 font-amiri text-3xl font-bold text-white sm:text-4xl">
              خلطة {mixture.name}
            </h1>
            <p className="mb-6 leading-relaxed text-zinc-400">{mixture.desc}</p>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-200">
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                كيف تعمل
              </h2>
              <ol className="space-y-2 text-sm leading-relaxed text-zinc-400">
                <li>
                  <span className="text-amber-500">١.</span> اختر نوع العسل الذي يعجبك — هو قاعدة
                  الخلطة.
                </li>
                <li>
                  <span className="text-amber-500">٢.</span> اختر الحجم؛ الجرعات ثابتة كما ضبطها
                  الخبير، والعسل يملأ الباقي.
                </li>
                <li>
                  <span className="text-amber-500">٣.</span> إن أردت، عدّل أي مكوّن ضمن الحدود
                  المسموحة — والسعر يتحدّث فوراً.
                </li>
              </ol>
              <p className="mt-4 border-t border-zinc-800 pt-3 text-xs leading-relaxed text-zinc-500">
                تُحضَّر كل خلطة عند الطلب وتصلك خلال أيام. المعلومات تثقيفية ولا تُغني عن استشارة
                الطبيب.
              </p>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <MixtureBuilder
              mixture={{
                slug: mixture.slug,
                name: mixture.name,
                tagline: mixture.tagline,
                desc: mixture.desc,
                sizes: mixture.sizes,
                defaultSize: mixture.defaultSize,
                prepFee: mixture.prepFee,
                ingredients: mixture.ingredients.map((i) => ({
                  id: i.id,
                  name: i.name,
                  note: i.note,
                  pricePerGram: i.pricePerGram,
                  minGrams: i.minGrams,
                  maxGrams: i.maxGrams,
                  recommended: i.recommended,
                  step: i.step,
                })),
              }}
              honeys={honeys}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
