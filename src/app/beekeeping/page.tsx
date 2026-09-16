import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Lightbulb, ShieldCheck } from 'lucide-react';
import { getGlossaryCards, orderCategories } from '@/lib/glossary.server';
import { SITE } from '@/lib/config';
import { GlossaryBrowser } from './GlossaryBrowser';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'موسوعة النحّال — أدوات ومعدات تربية النحل',
  description:
    'موسوعة مصوّرة لأدوات ومعدات تربية النحل واستخراج العسل: ما هي كل قطعة، وما وظيفتها داخل الخلية والمنحل. محتوى تعليمي من نحّالي الهيثم.',
  alternates: { canonical: '/beekeeping' },
  openGraph: {
    title: 'موسوعة النحّال — الهيثم نحل وعسل',
    description: 'أدوات ومعدات تربية النحل واستخراج العسل، مشروحة قطعةً قطعة.',
    images: [{ url: '/images/beekeeping/beekeeping-tools/bee-smoker.webp' }],
  },
};

export default async function BeekeepingGlossaryPage() {
  const entries = await getGlossaryCards();
  const categories = orderCategories(entries.map((e) => e.category));
  const tips = entries.filter((e) => e.hasTip).length;

  // ترميز موسوعة دقيق: مجموعة مصطلحات معرَّفة، لا صفحة منتجات
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${SITE.url}/beekeeping`,
    name: 'موسوعة النحّال — أدوات ومعدات تربية النحل',
    description: 'مرجع مصوّر لأدوات ومعدات تربية النحل واستخراج العسل من الهيثم — نحل وعسل.',
    inLanguage: 'ar',
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    hasDefinedTerm: entries.slice(0, 60).map((e) => ({
      '@type': 'DefinedTerm',
      '@id': `${SITE.url}/beekeeping/${e.slug}`,
      name: e.name,
      description: e.summary,
      termCode: e.slug,
    })),
  };

  return (
    <section className="min-h-screen bg-zinc-950 px-4 pt-28 pb-20 sm:px-6 sm:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="container mx-auto">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/[0.07] px-4 py-1.5 text-xs font-bold text-amber-300">
            <BookOpen className="h-4 w-4" /> محتوى تعليمي
          </p>
          <h1 className="font-amiri text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            موسوعة <span className="gold-text">النحّال</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:text-lg">
            خلف كل مرطبان عسل عالمٌ من الأدوات والمعرفة. هنا نشرح لك — قطعةً قطعة — ما يستخدمه
            النحّال داخل الخلية وفي ورشة الفرز، وكيف تعمل كل أداة ولماذا وُجدت.
          </p>
          <p className="mx-auto mt-4 max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
            <ShieldCheck className="ml-1.5 inline h-4 w-4 text-amber-500" />
            هذه الصفحات <b className="text-zinc-200">للتعريف والتعليم فقط</b> — لا نبيع هذه المعدات.
            متجرنا يقتصر على العسل والمكمّلات التي نستخرجها بأنفسنا.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
            <span>{entries.length} مدخلاً</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>{categories.length} تصنيفاً</span>
            {tips > 0 && (
              <>
                <span className="h-1 w-1 rounded-full bg-zinc-700" />
                <span className="inline-flex items-center gap-1 text-amber-400">
                  <Lightbulb className="h-3.5 w-3.5" /> {tips} نصيحة من نحّالينا
                </span>
              </>
            )}
          </div>
        </div>

        {entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500">
            لا مداخل منشورة بعد.
          </p>
        ) : (
          <GlossaryBrowser entries={entries} categories={categories} />
        )}

        <div className="mx-auto mt-14 max-w-3xl rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-6 text-center">
          <h2 className="font-amiri text-2xl font-bold text-white">من هذه الأدوات… إلى مرطبانك</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-400">
            كل ما قرأته هنا نمارسه فعلياً في مناحلنا منذ {SITE.foundedYear}. تذوّق النتيجة.
          </p>
          <Link
            href="/shop"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full gold-gradient px-6 text-sm font-black text-zinc-950 luxury-shadow"
          >
            تصفّح أنواع العسل
          </Link>
        </div>
      </div>
    </section>
  );
}
