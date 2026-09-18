import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Droplets,
  FileCheck2,
  Hexagon,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { getHarvestJourney } from '@/lib/harvest.server';
import { formatArticleDate, toIsoDay } from '@/lib/articles';
import { SITE, getWhatsAppLink } from '@/lib/config';
import { getSettings } from '@/lib/settings.server';
import { HarvestStep } from './HarvestStep';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'رحلة القطاف: من ختم القرص إلى المرطبان — موسوعة النحّال',
  description:
    'ثماني خطوات يمرّ بها العسل قبل أن يصل إليك: ختم القرص، رفع الإطارات، كشف الأغطية، الفرز، التصفية، الترقيد، التعبئة، ثم جواز الدفعة. بأدواتها ومن مناحل الهيثم.',
  alternates: { canonical: '/beekeeping/harvest' },
  openGraph: {
    title: 'رحلة القطاف — الهيثم نحل وعسل',
    description: 'من ختم القرص إلى مرطبان له جواز دفعة، خطوةً خطوة.',
    images: [{ url: '/images/beekeeping/honey-extraction/honey-extractor-manual.webp' }],
  },
};

/**
 * رحلة القطاف: الخطوات معرفة مهنية ثابتة في `HARVEST_STEPS`، والأدوات من الموسوعة،
 * ووسائط «هكذا نعمل» من الاستديو بوسم الخطوة، وتنتهي عند آخر جواز دفعة منشور ومنتجه.
 */
export default async function HarvestPage() {
  await getSettings();
  const { steps, passport } = await getHarvestJourney();

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
          name: 'رحلة القطاف',
          item: `${SITE.url}/beekeeping/harvest`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'كيف يُقطف العسل ويُعبّأ',
      description:
        'خطوات قطاف العسل من ختم القرص حتى التعبئة كما تُمارس في مناحل الهيثم — محتوى تعليمي.',
      inLanguage: 'ar',
      totalTime: 'P1D',
      supply: steps.flatMap((s) => s.tools).map((t) => ({ '@type': 'HowToSupply', name: t.name })),
      step: steps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.title,
        text: s.body,
        url: `${SITE.url}/beekeeping/harvest#step-${i + 1}`,
      })),
    },
  ];

  const passportFacts = passport
    ? [
        passport.harvestDate && {
          icon: Calendar,
          label: 'تاريخ القطاف',
          value: formatArticleDate(toIsoDay(passport.harvestDate)),
        },
        passport.region && { icon: MapPin, label: 'المنحل', value: passport.region },
        passport.moisture && { icon: Droplets, label: 'الفحص', value: passport.moisture },
      ].filter((f): f is { icon: typeof Calendar; label: string; value: string } => !!f)
    : [];

  return (
    <section className="min-h-screen bg-zinc-950 px-4 pt-28 pb-20 sm:px-6 sm:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="container mx-auto max-w-4xl">
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
          <span className="text-zinc-400">رحلة القطاف</span>
        </nav>

        <div className="mb-10 max-w-3xl sm:mb-14">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/[0.07] px-4 py-1.5 text-xs font-bold text-amber-300">
            <Droplets className="h-4 w-4" /> ثماني خطوات
          </p>
          <h1 className="font-amiri text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            رحلة <span className="gold-text">القطاف</span>
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-400 sm:text-lg">
            بين اللحظة التي يختم فيها النحل قرصه واللحظة التي تفتح فيها المرطبان، يمرّ العسل بثماني
            خطوات لا تُختصر. هذه هي — بأدواتها، وكما نمارسها في مناحلنا منذ {SITE.foundedYear}.
          </p>
        </div>

        <ol className="relative">
          {steps.map((step, i) => (
            <HarvestStep key={step.key} step={step} index={i + 1} total={steps.length}>
              {step.key === 'passport' &&
                (passport ? (
                  <div className="mt-5 rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-transparent p-4 sm:p-6">
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500">
                      <ShieldCheck className="h-4 w-4" /> آخر دفعة منشورة
                    </p>
                    <h3 className="mt-2 font-amiri text-2xl font-bold text-white">
                      {passport.title}
                    </h3>
                    <p className="mt-1 font-mono text-sm text-zinc-400" dir="ltr">
                      {passport.code}
                    </p>
                    {passportFacts.length > 0 && (
                      <dl className="mt-4 grid gap-2 sm:grid-cols-3">
                        {passportFacts.map((f) => (
                          <div
                            key={f.label}
                            className="flex items-start gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3"
                          >
                            <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                            <div className="min-w-0">
                              <dt className="text-[10px] text-zinc-500">{f.label}</dt>
                              <dd className="truncate text-sm font-bold text-white">{f.value}</dd>
                            </div>
                          </div>
                        ))}
                      </dl>
                    )}
                    {passport.labReportUrl && (
                      <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-300">
                        <FileCheck2 className="h-3.5 w-3.5" /> لهذه الدفعة تقرير مخبري منشور
                      </p>
                    )}

                    {passport.product && (
                      <Link
                        href={`/product/${passport.product.slug}`}
                        className="group mt-5 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 transition hover:border-amber-500/40"
                      >
                        <img
                          src={passport.product.image}
                          alt=""
                          loading="lazy"
                          className="h-16 w-16 shrink-0 rounded-xl object-cover"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[10px] text-zinc-500">المرطبان الناتج</span>
                          <span className="block truncate font-amiri text-lg font-bold text-white group-hover:text-amber-400">
                            {passport.product.name}
                          </span>
                          {passport.product.weight && (
                            <span className="block text-[11px] text-zinc-500">
                              {passport.product.weight}
                            </span>
                          )}
                        </span>
                        <ArrowLeft className="h-4 w-4 shrink-0 text-amber-500" />
                      </Link>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href={`/batch/${passport.code}`}
                        className="inline-flex h-11 items-center gap-2 rounded-full gold-gradient px-5 text-sm font-black text-zinc-950 luxury-shadow"
                      >
                        <ShieldCheck className="h-4 w-4" /> افتح جواز الدفعة
                      </Link>
                      {passport.product && (
                        <Link
                          href={`/product/${passport.product.slug}`}
                          className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-700 px-5 text-sm font-bold text-zinc-200 transition hover:border-amber-500/50 hover:text-amber-300"
                        >
                          اطلب هذا العسل
                        </Link>
                      )}
                      <a
                        href={getWhatsAppLink(
                          `مرحباً ${SITE.name}، شاهدت رحلة القطاف وأودّ الاستفسار عن الدفعة ${passport.code}.`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500/20"
                      >
                        <MessageCircle className="h-4 w-4" /> استفسر عبر واتساب
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-6 text-center">
                    <p className="text-sm text-zinc-400">
                      جوازات الدفعات تُنشر مع كل موسم قطاف. تصفّح أنواع العسل المتاحة الآن.
                    </p>
                    <Link
                      href="/shop"
                      className="mt-4 inline-flex h-11 items-center gap-2 rounded-full gold-gradient px-6 text-sm font-black text-zinc-950 luxury-shadow"
                    >
                      تصفّح المتجر
                    </Link>
                  </div>
                ))}
            </HarvestStep>
          ))}
        </ol>

        <div className="mt-12 flex flex-wrap items-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="flex-1 text-sm text-zinc-400">
            <ShieldCheck className="ml-1.5 inline h-4 w-4 text-amber-500/70" />
            محتوى تعليمي — لا نبيع هذه المعدات. أردت أن ترى أين تعيش الطائفة قبل القطاف؟
          </p>
          <Link
            href="/beekeeping/hive"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-700 px-5 text-sm font-bold text-zinc-200 transition hover:border-amber-500/50 hover:text-amber-300"
          >
            <Hexagon className="h-4 w-4" /> ادخل الخلية
          </Link>
        </div>
      </div>
    </section>
  );
}
