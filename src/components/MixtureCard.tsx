import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { CURRENCY, formatAmount } from '@/lib/money';

export interface MixtureCardData {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  desc: string;
  image: string | null;
  ingredientNames: string[];
  fromPrice: number | null;
}

/**
 * بطاقة خلطة بنفس لغة بطاقة المنتج (صورة، اسم، سعر، زر) —
 * الفرق أن السعر «يبدأ من» لأن الزبون يختار العسل والحجم والمقادير.
 */
export default function MixtureCard({ mixture }: { mixture: MixtureCardData }) {
  return (
    <article className="group relative flex snap-start flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 shadow-lg shadow-black/40 ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-2xl hover:ring-amber-500/20 sm:rounded-[2rem] md:rounded-[2.5rem]">
      <Link href={`/custom-mixtures/${mixture.slug}`} className="relative block flex-shrink-0">
        {mixture.image ? (
          <span className="relative block aspect-[4/5] w-full sm:aspect-[4/3]">
            <Image
              src={mixture.image}
              alt={`خلطة ${mixture.name}`}
              fill
              sizes="(max-width: 640px) 46vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </span>
        ) : (
          <div className="flex aspect-[4/5] w-full items-center justify-center bg-zinc-900 sm:aspect-[4/3]">
            <SlidersHorizontal className="h-10 w-10 text-zinc-700" />
          </div>
        )}
        <span className="absolute top-2.5 right-2.5 z-10 rounded-full border border-amber-500/30 bg-zinc-950/80 px-2 py-0.5 text-[9px] font-black text-amber-300 backdrop-blur-sm sm:top-4 sm:right-4 sm:px-3 sm:py-1 sm:text-[10px]">
          تُصمّمها بنفسك
        </span>
      </Link>

      <div className="flex flex-grow flex-col p-3 sm:p-6 md:p-8">
        <Link href={`/custom-mixtures/${mixture.slug}`} className="block">
          <h4 className="line-clamp-2 font-amiri text-[15px] font-bold leading-[1.3] text-white transition-colors group-hover:text-amber-400 sm:text-xl md:text-2xl">
            خلطة {mixture.name}
          </h4>
        </Link>
        <p className="mt-1 truncate text-[10px] font-semibold text-amber-500/90 sm:mt-2 sm:text-xs">
          {mixture.tagline}
        </p>

        <p className="mt-3 mb-4 hidden flex-grow text-sm leading-relaxed text-zinc-400 line-clamp-2 sm:block">
          {mixture.desc}
        </p>

        <ul className="mb-4 hidden flex-wrap gap-1.5 sm:flex">
          <li className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[11px] text-zinc-300">
            عسل من اختيارك
          </li>
          {mixture.ingredientNames.slice(0, 3).map((name) => (
            <li
              key={name}
              className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[11px] text-zinc-300"
            >
              {name}
            </li>
          ))}
        </ul>

        {mixture.fromPrice !== null && (
          <p className="mt-2.5 leading-none sm:mt-0 sm:mb-4">
            <span className="text-[10px] text-zinc-500 sm:text-xs">تبدأ من </span>
            <span className="gold-text text-lg font-bold tabular-nums sm:text-2xl">
              {formatAmount(mixture.fromPrice)}
            </span>
            <span className="mr-1 text-[11px] text-zinc-500 sm:text-sm">{CURRENCY.label}</span>
          </p>
        )}

        <div className="mt-auto pt-3 sm:border-t sm:border-white/5 sm:pt-4">
          <Link
            href={`/custom-mixtures/${mixture.slug}`}
            className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-amber-500 text-[13px] font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-amber-500/40 sm:h-auto sm:py-2.5 sm:text-sm"
          >
            صمّم خلطتك
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
