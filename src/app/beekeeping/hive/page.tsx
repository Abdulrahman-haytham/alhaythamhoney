import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Droplets, Hexagon, ShieldCheck } from 'lucide-react';
import { HIVE_LAYERS, HIVE_SLUGS } from '@/lib/hive';
import { getEntriesBySlugs } from '@/lib/glossary.server';
import { toArabicIndic } from '@/lib/glossary';
import { SITE } from '@/lib/config';
import { HiveExplorer, type HiveLayerView } from './HiveExplorer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'داخل خلية النحل: الأجزاء ووظائفها — موسوعة النحّال',
  description:
    'افتح خلية لانغستروث طبقةً طبقة: الغطاء، العاسلة، حاجز الملكة، صندوق الحضنة، القاعدة والمدخل — ما وظيفة كل جزء ولماذا رُتّب هكذا. رسم تفاعلي من نحّالي الهيثم.',
  alternates: { canonical: '/beekeeping/hive' },
  openGraph: {
    title: 'داخل خلية النحل — الهيثم نحل وعسل',
    description: 'خلية لانغستروث مفكّكة طبقةً طبقة، بشرح كل جزء ووظيفته.',
    images: [{ url: '/images/beekeeping/beehive-components/langstroth-beehive.webp' }],
  },
};

/**
 * الخلية التفاعلية: الهيكل (الطبقات وترتيبها) من `HIVE_LAYERS`، والنصوص والصور من مداخل
 * الموسوعة المنشورة. القائمة المرتّبة تحت الرسم روابط حقيقية — تعمل بلا JavaScript وتُفهرَس.
 */
export default async function HivePage() {
  const entries = await getEntriesBySlugs(HIVE_SLUGS);
  const layers: HiveLayerView[] = HIVE_LAYERS.flatMap((l) => {
    const entry = entries.get(l.slug);
    if (!entry) return [];
    const frames = 'framesSlug' in l ? entries.get(l.framesSlug) : undefined;
    return [
      {
        key: l.key,
        kind: l.kind,
        height: l.height,
        position: l.position,
        slug: entry.slug,
        name: entry.name,
        summary: entry.summary,
        image: entry.image,
        frames: frames ? { slug: frames.slug, name: frames.name } : null,
      },
    ];
  });

  const jsonLd = [
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
        {
          '@type': 'ListItem',
          position: 3,
          name: 'داخل الخلية',
          item: `${SITE.url}/beekeeping/hive`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'طبقات خلية لانغستروث من الأعلى إلى الأسفل',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: layers.length,
      itemListElement: layers.map((l, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: l.name,
        url: `${SITE.url}/beekeeping/${l.slug}`,
      })),
    },
  ];

  return (
    <section className="min-h-screen bg-zinc-950 px-4 pt-28 pb-20 sm:px-6 sm:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="container mx-auto max-w-5xl">
        <nav
          aria-label="مسار الصفحة"
          className="mb-6 flex items-center gap-2 text-xs text-zinc-500"
        >
          <Link
            href="/beekeeping"
            className="inline-flex items-center gap-1.5 hover:text-amber-400"
          >
            <BookOpen className="h-3.5 w-3.5" /> موسوعة النحّال
          </Link>
          <span>/</span>
          <span className="text-zinc-400">داخل الخلية</span>
        </nav>

        <div className="mb-8 max-w-3xl sm:mb-10">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/[0.07] px-4 py-1.5 text-xs font-bold text-amber-300">
            <Hexagon className="h-4 w-4" /> رسم تفاعلي
          </p>
          <h1 className="font-amiri text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            داخل <span className="gold-text">الخلية</span>
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-400 sm:text-lg">
            خلية لانغستروث التي نعمل بها ليست صندوقاً واحداً، بل طبقات تُفكّ وتُركّب: مخزن للعسل في
            الأعلى، وبيت للحضنة في الأسفل، وبينهما حاجز يبقي الملكة حيث يجب أن تكون. افتحها طبقةً
            طبقة.
          </p>
        </div>

        {layers.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500">
            مداخل مكوّنات الخلية غير منشورة بعد.
          </p>
        ) : (
          <HiveExplorer layers={layers} />
        )}

        <section className="mt-12 sm:mt-16" aria-labelledby="hive-list-title">
          <h2 id="hive-list-title" className="mb-4 font-amiri text-2xl font-bold text-white">
            الطبقات من الأعلى إلى الأسفل
          </h2>
          <ol className="grid gap-2 sm:grid-cols-2">
            {layers.map((l, i) => (
              <li key={l.key}>
                <Link
                  href={`/beekeeping/${l.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 transition hover:border-amber-500/40"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-500/40 font-amiri text-base font-bold text-amber-300">
                    {toArabicIndic(i + 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] text-zinc-500">{l.position}</span>
                    <span className="block truncate font-amiri text-lg font-bold text-white group-hover:text-amber-400">
                      {l.name}
                    </span>
                  </span>
                  <ArrowLeft className="h-4 w-4 shrink-0 text-amber-500" />
                </Link>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-zinc-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-500/70" />
            أفراد الخلية — الملكة والشغالات والذكور — يُضافون لاحقاً بصور حقيقية من منحلنا، لا صور
            مولّدة. محتوى تعليمي؛ لا نبيع هذه المعدات.
          </p>
        </section>

        <div className="mx-auto mt-14 max-w-3xl rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-6 text-center">
          <h2 className="font-amiri text-2xl font-bold text-white">وماذا بعد أن تمتلئ العاسلة؟</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-400">
            تابع العسل من ختم القرص حتى مرطبان له جواز دفعة.
          </p>
          <Link
            href="/beekeeping/harvest"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full gold-gradient px-6 text-sm font-black text-zinc-950 luxury-shadow"
          >
            <Droplets className="h-4 w-4" /> رحلة القطاف
          </Link>
        </div>
      </div>
    </section>
  );
}
