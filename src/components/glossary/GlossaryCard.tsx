import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import { toArabicIndic, type GlossaryCard as GlossaryCardData } from '@/lib/glossary';

/**
 * بطاقة مدخل في الموسوعة — تُستخدم داخل أقسام المراحل وفي شبكة نتائج البحث.
 * الصور استوديو بخلفية بيضاء: صندوق بلون ورقي دافئ مع mix-blend-multiply يذيب الأبيض فيه.
 */
export function GlossaryCard({
  entry,
  stage,
  headingLevel = 'h3',
}: {
  entry: GlossaryCardData;
  /** رقم المرحلة واسمها للسطر العلوي — اختياري في شبكة البحث */
  stage?: { index: number; name: string };
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;
  return (
    <Link
      href={`/beekeeping/${entry.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:bg-zinc-900/70"
    >
      <div className="relative aspect-square overflow-hidden bg-[#f6f1e7]">
        <Image
          src={entry.image}
          alt={entry.name}
          fill
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-3 mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {entry.hasTip && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-zinc-950/85 px-2 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-amber-500/40">
            <Lightbulb className="h-3 w-3" /> نصيحة
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <span className="mb-1 text-[10px] font-bold text-amber-500/80">
          {stage ? `المرحلة ${toArabicIndic(stage.index)} · ${stage.name}` : entry.category}
        </span>
        <Heading className="font-amiri text-base font-bold leading-snug text-white transition-colors group-hover:text-amber-400 sm:text-lg">
          {entry.name}
        </Heading>
        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-zinc-500 sm:text-[13px]">
          {entry.summary}
        </p>
        <span className="mt-auto inline-flex items-center gap-1 pt-2 text-[11px] font-bold text-amber-400 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
          اقرأ <ArrowLeft className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
