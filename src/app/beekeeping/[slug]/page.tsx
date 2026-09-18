import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ExternalLink,
  Lightbulb,
  MessageCircle,
  PencilLine,
  ShieldCheck,
} from 'lucide-react';
import { getGlossaryEntry, getSiblingEntries, getStageContext } from '@/lib/glossary.server';
import { toArabicIndic } from '@/lib/glossary';
import { requireAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/settings.server';
import { SITE } from '@/lib/config';
import { StageIcon } from '@/components/glossary/StageIcon';
import { GlossaryAuthorBox } from '@/components/glossary/GlossaryAuthorBox';

// تقرأ جلسة الأدمن لمعاينة المسودّات، فلا تُخزَّن.
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
    keywords: [entry.name, ...entry.aliases, entry.category, 'تربية النحل', 'أدوات النحّال'],
    alternates: { canonical: `/beekeeping/${entry.slug}` },
    openGraph: {
      title: `${entry.name} — ما هو ولماذا يستخدمه النحّال؟`,
      description: entry.summary.slice(0, 180),
      images: [{ url: entry.image }],
    },
  };
}

const isUrl = (s: string) => /^https?:\/\//i.test(s);

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
  const [siblings, stage] = await Promise.all([
    getSiblingEntries(entry.category, entry.slug),
    getStageContext(entry.category, entry.slug),
  ]);

  const pageUrl = `${SITE.url}/beekeeping/${entry.slug}`;
  const stageHref = stage ? `/beekeeping#${stage.id}` : '/beekeeping';
  const shareText = `${entry.name} — ${entry.summary.slice(0, 120)}… ${pageUrl}`;
  const shareHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const authors = [
    { '@type': 'Person', name: 'عبد الرحمن', url: `${SITE.url}/about-us` },
    { '@type': 'Person', name: 'تركي', url: `${SITE.url}/about-us` },
  ];
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'DefinedTerm',
      '@id': pageUrl,
      name: entry.name,
      ...(entry.aliases.length > 0 && { alternateName: entry.aliases }),
      description: entry.summary,
      termCode: entry.slug,
      image: new URL(entry.image, SITE.url).href,
      inDefinedTermSet: {
        '@type': 'DefinedTermSet',
        '@id': `${SITE.url}/beekeeping`,
        name: 'موسوعة النحّال',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${pageUrl}#page`,
      url: pageUrl,
      name: `${entry.name} — موسوعة النحّال`,
      inLanguage: 'ar',
      dateModified: entry.updatedAt.toISOString(),
      author: authors,
      publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
      mainEntity: { '@id': pageUrl },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE.url },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'موسوعة النحّال',
          item: `${SITE.url}/beekeeping`,
        },
        ...(stage
          ? [
              {
                '@type': 'ListItem',
                position: 3,
                name: stage.name,
                item: `${SITE.url}${stageHref}`,
              },
              { '@type': 'ListItem', position: 4, name: entry.name, item: pageUrl },
            ]
          : [{ '@type': 'ListItem', position: 3, name: entry.name, item: pageUrl }]),
      ],
    },
  ];

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

        <nav
          aria-label="مسار الصفحة"
          className="mb-4 flex items-center gap-2 text-xs text-zinc-500"
        >
          <Link
            href="/beekeeping"
            className="inline-flex items-center gap-1.5 hover:text-amber-400"
          >
            <BookOpen className="h-3.5 w-3.5" /> موسوعة النحّال
          </Link>
          <span>/</span>
          <Link href={stageHref} className="text-zinc-400 hover:text-amber-400">
            {entry.category}
          </Link>
        </nav>

        {stage && (
          <Link
            href={stageHref}
            className="mb-6 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 transition hover:border-amber-500/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <StageIcon icon={stage.icon} className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/80">
                المرحلة {toArabicIndic(stage.index)} من {toArabicIndic(stage.total)} · {stage.name}
              </span>
              {stage.intro && (
                <span className="mt-0.5 line-clamp-1 block text-xs text-zinc-400">
                  {stage.intro}
                </span>
              )}
            </span>
          </Link>
        )}

        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-start">
          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-[#f6f1e7]">
            <img
              src={entry.image}
              alt={entry.name}
              width={1000}
              height={1000}
              fetchPriority="high"
              className="h-full w-full object-contain p-4 mix-blend-multiply"
            />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-500">
              {entry.category}
            </span>
            <h1 className="mt-2 font-amiri text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
              {entry.name}
            </h1>
            {entry.aliases.length > 0 && (
              <p className="mt-2 text-sm text-zinc-500">
                يُعرف أيضاً بـ: <span className="text-zinc-300">{entry.aliases.join('، ')}</span>
              </p>
            )}
            <p className="mt-5 text-base leading-loose text-zinc-300 sm:text-lg">{entry.summary}</p>

            {entry.tip?.trim() ? (
              <div className="mt-7 rounded-l-2xl border-r-4 border-amber-500 bg-zinc-900/60 p-5">
                <p className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-300">
                  <Lightbulb className="h-4 w-4" /> نصيحة الهيثم
                </p>
                <p className="text-sm leading-relaxed text-zinc-200 sm:text-base">{entry.tip}</p>
                <p className="mt-3 text-xs text-zinc-500">
                  — من خبرة مناحلنا منذ {SITE.foundedYear}
                </p>
              </div>
            ) : (
              admin && (
                <Link
                  href={`/admin/glossary#${entry.id}`}
                  className="mt-7 flex items-center gap-2 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-300 hover:bg-amber-500/10"
                >
                  <PencilLine className="h-4 w-4 shrink-0" />
                  لا نصيحة لهذا المدخل بعد — أضف «نصيحة الهيثم» من اللوحة. (يراه الأدمن فقط)
                </Link>
              )
            )}

            <div className="mt-6">
              <GlossaryAuthorBox updatedAt={entry.updatedAt} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={shareHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
              >
                <MessageCircle className="h-4 w-4" /> شارك على واتساب
              </a>
              <p className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-500/70" />
                محتوى تعليمي — لا نبيع هذه المعدات.
              </p>
            </div>
          </div>
        </div>

        {entry.sources.length > 0 && (
          <section className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h2 className="mb-3 font-amiri text-lg font-bold text-white">المصادر والمراجع</h2>
            <ol className="list-inside list-decimal space-y-1.5 text-sm text-zinc-400">
              {entry.sources.map((source) => (
                <li key={source} className="break-words">
                  {isUrl(source) ? (
                    <a
                      href={source}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="inline-flex items-center gap-1 text-amber-400 hover:underline"
                      dir="ltr"
                    >
                      {source.replace(/^https?:\/\//i, '').replace(/\/$/, '')}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    source
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {stage && (stage.prev || stage.next) && (
          <nav aria-label="التنقّل داخل المرحلة" className="mt-12 grid gap-3 sm:grid-cols-2">
            {stage.prev ? (
              <Link
                href={`/beekeeping/${stage.prev.slug}`}
                className="group flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 transition hover:border-amber-500/40"
              >
                <ArrowRight className="h-4 w-4 shrink-0 text-amber-500" />
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f6f1e7]">
                  <img
                    src={stage.prev.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-contain p-1 mix-blend-multiply"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] text-zinc-500">الأداة السابقة</span>
                  <span className="block truncate font-amiri text-base font-bold text-white group-hover:text-amber-400">
                    {stage.prev.name}
                  </span>
                </span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {stage.next && (
              <Link
                href={`/beekeeping/${stage.next.slug}`}
                className="group flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 text-left transition hover:border-amber-500/40 sm:flex-row-reverse"
              >
                <ArrowLeft className="h-4 w-4 shrink-0 text-amber-500" />
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f6f1e7]">
                  <img
                    src={stage.next.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-contain p-1 mix-blend-multiply"
                  />
                </span>
                <span className="min-w-0 sm:text-left">
                  <span className="block text-[10px] text-zinc-500">الأداة التالية</span>
                  <span className="block truncate font-amiri text-base font-bold text-white group-hover:text-amber-400">
                    {stage.next.name}
                  </span>
                </span>
              </Link>
            )}
          </nav>
        )}

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
              <h2 className="font-amiri text-2xl font-bold text-white">من المرحلة نفسها</h2>
              <Link
                href={stageHref}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-500 hover:text-amber-400"
              >
                كل المرحلة <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {siblings.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/beekeeping/${s.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 transition hover:border-amber-500/40"
                  >
                    <div className="aspect-square bg-[#f6f1e7]">
                      <img
                        src={s.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-contain p-2 mix-blend-multiply"
                      />
                    </div>
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
