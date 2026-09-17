import { toArabicIndic, type GlossaryStage } from '@/lib/glossary';
import { GlossaryCard } from '@/components/glossary/GlossaryCard';
import { StageIcon } from '@/components/glossary/StageIcon';

/**
 * قسم مرحلة في رحلة الموسوعة — مكوّن خادم: العنوان والبطاقات في HTML الأولي
 * (مفهرسة وتعمل بلا JavaScript). `data-stage` يقرؤه شريط التنقّل لتمييز المرحلة الظاهرة.
 */
export function StageSection({ stage, total }: { stage: GlossaryStage; total: number }) {
  return (
    <section
      id={stage.id}
      data-stage={stage.index}
      aria-labelledby={`${stage.id}-title`}
      className="mb-14 scroll-mt-32 sm:mb-20 md:scroll-mt-44"
    >
      <header className="mb-6 sm:mb-8">
        <div className="mb-3 flex items-center gap-3 md:mb-4">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-500/40 bg-zinc-950 font-amiri text-lg font-bold text-amber-300"
          >
            {toArabicIndic(stage.index)}
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-500 sm:rounded-xl">
            <StageIcon icon={stage.icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/80">
              المرحلة {toArabicIndic(stage.index)} من {toArabicIndic(total)}
            </p>
            <h2
              id={`${stage.id}-title`}
              className="font-amiri text-2xl font-black leading-tight text-white sm:text-3xl md:text-4xl"
            >
              {stage.name}
            </h2>
          </div>
          <span className="mr-auto shrink-0 rounded-full border border-zinc-800 px-2.5 py-1 text-[11px] text-zinc-500">
            {stage.count} مدخلاً
          </span>
        </div>
        <div className="mb-4 h-1 w-12 rounded-full bg-amber-500/70 sm:mb-5" />
        {stage.intro && (
          <p className="max-w-2xl border-r-2 border-amber-500/20 pr-3 text-sm text-zinc-400 sm:pr-4 sm:text-base">
            {stage.intro}
          </p>
        )}
      </header>

      <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {stage.entries.map((entry) => (
          <li key={entry.slug}>
            <GlossaryCard entry={entry} stage={{ index: stage.index, name: stage.name }} />
          </li>
        ))}
      </ul>
    </section>
  );
}
