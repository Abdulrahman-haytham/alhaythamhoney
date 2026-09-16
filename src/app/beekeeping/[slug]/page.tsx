import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Lightbulb, ShieldCheck } from 'lucide-react';
import { getGlossaryEntry, getSiblingEntries } from '@/lib/glossary.server';
import { requireAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/settings.server';
import { SITE } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getGlossaryEntry(slug);
  if (!entry) return {};
  return {
    title: `${entry.name} — موسوعة النحّال`,
    description: entry.summary.slice(0, 180),
    alternates: { canonical: `/beekeeping/${entry.slug}` },
    openGraph: {
      title: `${entry.name} — ما هو ولماذا يستخدمه النحّال؟`,
      description: entry.summary.slice(0, 180),
      images: [{ url: entry.image }],
    },
  };
}

/**
 * صفحة مدخل في الموسوعة: محتوى تعليمي مستقل برابط خاص به.
 * لا سعر ولا زر شراء — المنتجات المرتبطة تظهر كجسر اختياري إلى المتجر فقط.
 */
export default async function GlossaryEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = await requireAdmin();
  const entry = await getGlossaryEntry(slug, !!admin);
  if (!entry) notFound();
  await getSettings();
  const siblings = await getSiblingEntries(entry.category, entry.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `${SITE.url}/beekeeping/${entry.slug}`,
    name: entry.name,
    description: entry.summary,
    termCode: entry.slug,
    image: new URL(entry.image, SITE.url).href,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      '@id': `${SITE.url}/beekeeping`,
      name: 'موسوعة النحّال',
    },
  };

  return (
    <article className="min-h-screen bg-zinc-950 px-4 pt-28 pb-20 sm:px-6 sm:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="container mx-auto max-w-4xl">
        {!entry.published && (
          <p className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
            مسودّة — لا يراها الزوار حتى تُنشر.
          </p>
        )}

        <nav className="mb-6 flex items-center gap-2 text-xs text-zinc-500">
          <Link
            href="/beekeeping"
            className="inline-flex items-center gap-1.5 hover:text-amber-400"
          >
            <BookOpen className="h-3.5 w-3.5" /> موسوعة النحّال
          </Link>
          <span>/</span>
          <span className="text-zinc-400">{entry.category}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-start">
          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-white">
            <img
              src={entry.image}
              alt={entry.name}
              width={1000}
              height={1000}
              fetchPriority="high"
              className="h-full w-full object-contain p-4"
            />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-500">
              {entry.category}
            </span>
            <h1 className="mt-2 font-amiri text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
              {entry.name}
            </h1>
            <p className="mt-5 text-base leading-loose text-zinc-300 sm:text-lg">{entry.summary}</p>

            {entry.tip?.trim() && (
              <div className="mt-7 rounded-l-2xl border-r-4 border-amber-500 bg-zinc-900/60 p-5">
                <p className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-300">
                  <Lightbulb className="h-4 w-4" /> نصيحة الهيثم
                </p>
                <p className="text-sm leading-relaxed text-zinc-200 sm:text-base">{entry.tip}</p>
                <p className="mt-3 text-xs text-zinc-500">
                  — من خبرة مناحلنا منذ {SITE.foundedYear}
                </p>
              </div>
            )}

            <p className="mt-7 flex items-start gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs leading-relaxed text-zinc-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-500/70" />
              محتوى تعليمي للتعريف بعالم النحالة. لا نبيع هذه المعدات — متجرنا للعسل والمكمّلات التي
              ننتجها بأنفسنا.
            </p>
          </div>
        </div>

        {entry.products.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 font-amiri text-2xl font-bold text-white">
              من هذه الأداة إلى مائدتك
            </h2>
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {entry.products.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/product/${p.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 transition hover:border-amber-500/40"
                  >
                    <img
                      src={p.image}
                      alt=""
                      loading="lazy"
                      className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="p-3">
                      <h3 className="font-amiri text-sm font-bold text-white group-hover:text-amber-400 sm:text-base">
                        {p.name}
                      </h3>
                      {p.weight && <p className="mt-0.5 text-[11px] text-zinc-500">{p.weight}</p>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {siblings.length > 0 && (
          <section className="mt-14">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="font-amiri text-2xl font-bold text-white">من التصنيف نفسه</h2>
              <Link
                href="/beekeeping"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-500 hover:text-amber-400"
              >
                كل الموسوعة <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {siblings.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/beekeeping/${s.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 transition hover:border-amber-500/40"
                  >
                    <img
                      src={s.image}
                      alt=""
                      loading="lazy"
                      className="aspect-square w-full bg-white object-contain p-2"
                    />
                    <div className="p-3">
                      <h3 className="font-amiri text-sm font-bold text-white group-hover:text-amber-400 sm:text-base">
                        {s.name}
                      </h3>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
