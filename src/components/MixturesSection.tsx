import Link from 'next/link';
import { SlidersHorizontal, ArrowLeft } from 'lucide-react';
import MixtureCard, { type MixtureCardData } from '@/components/MixtureCard';

/**
 * الخلطات كبطاقات على الرئيسية بنفس سلوك المنتجات:
 * على الجوال بطاقتان ظاهرتان مع تمرير أفقي، وعلى الشاشات الأكبر شبكة.
 */
export default function MixturesSection({
  mixtures,
  mobileCarousel = false,
}: {
  mixtures: MixtureCardData[];
  mobileCarousel?: boolean;
}) {
  if (mixtures.length === 0) return null;

  return (
    <section id="mixtures" className="bg-zinc-950 px-4 py-12 sm:px-6 sm:py-16 md:py-24">
      <div className="container mx-auto">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
              <SlidersHorizontal className="h-5 w-5 text-amber-500" strokeWidth={1.5} />
            </span>
            <div>
              <h2 className="font-amiri text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                الخلطات الخاصة — تُصمّمها بنفسك
              </h2>
              <p className="mt-1 border-r-2 border-amber-500/20 pr-3 text-sm text-zinc-400 sm:pr-4 sm:text-base">
                وصفة الخبير جاهزة، وأنت تختار العسل والحجم وتعدّل المقادير ضمن حدودها
              </p>
            </div>
          </div>
          <Link
            href="/custom-mixtures"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-400 transition-colors hover:text-amber-300"
          >
            كل الخلطات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div
          className={
            mobileCarousel
              ? '-mx-4 grid snap-x snap-mandatory auto-cols-[43%] grid-flow-col grid-rows-1 gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:snap-none sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0 md:gap-10 lg:grid-cols-3'
              : 'grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:gap-10 lg:grid-cols-3'
          }
        >
          {mixtures.map((m) => (
            <MixtureCard key={m.id} mixture={m} />
          ))}
        </div>
      </div>
    </section>
  );
}
