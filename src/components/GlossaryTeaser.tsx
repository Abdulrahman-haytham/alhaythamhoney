import Link from 'next/link';
import { ArrowLeft, BookOpen, Droplets, Hexagon } from 'lucide-react';
import { getGlossaryJourneyPreview } from '@/lib/glossary.server';
import { toArabicIndic } from '@/lib/glossary';
import { StageIcon } from '@/components/glossary/StageIcon';

/**
 * تشويق الموسوعة في الرئيسية: بلاطة لكل مرحلة (مدخل تمثيلي واحد) بترتيب الرحلة.
 * مكوّن خادم يقرأ القاعدة مباشرة؛ يختفي كلياً إن كانت المراحل المنشورة أقل من ثلاث.
 * ليس قسم بيع — يربط الثقة («نعرف أدواتنا») بالمتجر بلا سعر ولا زر شراء.
 */
export async function GlossaryTeaser() {
  const stops = await getGlossaryJourneyPreview(6);
  if (stops.length === 0) return null;

  return (
    <section className="bg-zinc-950 px-4 py-12 sm:px-6 sm:py-16 md:py-24">
      <div className="container mx-auto">
        <div className="mb-8 sm:mb-12">
          <div className="mb-3 flex items-center gap-2 sm:gap-3 md:mb-4 md:gap-4">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-amber-500 sm:rounded-xl sm:p-2.5 md:p-3">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
            </div>
            <h2 className="font-amiri text-2xl font-black leading-tight text-white sm:text-3xl md:text-4xl">
              من الخلية إلى المرطبان
            </h2>
          </div>
          <div className="mb-4 h-1 w-12 rounded-full bg-amber-500/70 sm:mb-5" />
          <p className="max-w-2xl border-r-2 border-amber-500/20 pr-3 text-sm text-zinc-400 sm:pr-4 sm:text-base">
            نعرف أدواتنا قطعةً قطعة. موسوعة النحّال تشرح ما يجري خلف كل مرطبان — محتوى تعليمي مجاني،
            لا نبيع فيه شيئاً.
          </p>
        </div>

        <ol className="-mx-4 grid snap-x snap-mandatory auto-cols-[62%] grid-flow-col grid-rows-1 gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-3 sm:snap-none sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6">
          {stops.map((stop) => (
            <li key={stop.entry.slug} className="snap-start">
              <Link
                href={`/beekeeping#stage-${stop.index}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 transition hover:-translate-y-1 hover:border-amber-500/40"
              >
                <div className="relative aspect-[4/3] bg-[#f6f1e7]">
                  <img
                    src={stop.entry.image}
                    alt={stop.entry.name}
                    loading="lazy"
                    decoding="async"
                    width={700}
                    height={525}
                    className="h-full w-full object-contain p-3 mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <span className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950/85 font-amiri text-sm font-bold text-amber-300 ring-1 ring-amber-500/40">
                    {toArabicIndic(stop.index)}
                  </span>
                </div>
                <div className="p-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500/80">
                    <StageIcon icon={stop.icon} className="h-3 w-3" /> {stop.name}
                  </p>
                  <h3 className="mt-1 font-amiri text-base font-bold text-white group-hover:text-amber-400">
                    {stop.entry.name}
                  </h3>
                </div>
              </Link>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
          <Link
            href="/beekeeping"
            className="inline-flex h-11 items-center gap-2 rounded-full gold-gradient px-6 text-sm font-black text-zinc-950 luxury-shadow"
          >
            تصفّح الموسوعة كاملة <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link
            href="/beekeeping/hive"
            className="inline-flex h-11 items-center gap-1.5 rounded-full border border-zinc-700 px-4 text-xs font-bold text-zinc-300 transition hover:border-amber-500/50 hover:text-amber-300"
          >
            <Hexagon className="h-4 w-4" /> ادخل الخلية
          </Link>
          <Link
            href="/beekeeping/harvest"
            className="inline-flex h-11 items-center gap-1.5 rounded-full border border-zinc-700 px-4 text-xs font-bold text-zinc-300 transition hover:border-amber-500/50 hover:text-amber-300"
          >
            <Droplets className="h-4 w-4" /> رحلة القطاف
          </Link>
        </div>
      </div>
    </section>
  );
}
