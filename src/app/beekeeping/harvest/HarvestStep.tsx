import Link from 'next/link';
import { Camera } from 'lucide-react';
import { toArabicIndic } from '@/lib/glossary';
import type { HarvestJourneyStep } from '@/lib/harvest.server';

/**
 * خطوة في خط القطاف الزمني — مكوّن خادم: النص والأدوات والوسائط في HTML الأولي.
 * كتلة «هكذا نعمل» لا تظهر إلا إن وسم الأدمن لقطة استديو بمفتاح هذه الخطوة.
 */
export function HarvestStep({
  step,
  index,
  total,
  children,
}: {
  step: HarvestJourneyStep;
  index: number;
  total: number;
  children?: React.ReactNode;
}) {
  return (
    <li
      id={`step-${index}`}
      className="relative scroll-mt-28 pb-10 pr-10 last:pb-0 sm:pr-14 md:scroll-mt-32"
    >
      {/* خط الزمن + الرقم (يمين، اتجاه عربي) */}
      <span
        aria-hidden
        className={`absolute top-10 right-[19px] w-px bg-gradient-to-b from-amber-500/40 to-zinc-800 sm:right-[23px] ${
          index === total ? 'hidden' : 'bottom-0'
        }`}
      />
      <span
        aria-hidden
        className="absolute top-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/40 bg-zinc-950 font-amiri text-lg font-bold text-amber-300 sm:h-12 sm:w-12 sm:text-xl"
      >
        {toArabicIndic(index)}
      </span>

      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/80">
        الخطوة {toArabicIndic(index)} من {toArabicIndic(total)}
      </p>
      <h2 className="mt-1 font-amiri text-2xl font-black leading-tight text-white sm:text-3xl">
        {step.title}
      </h2>
      <p className="mt-1 font-amiri text-lg text-amber-200/80">{step.lead}</p>
      <p className="mt-3 max-w-2xl text-sm leading-loose text-zinc-400 sm:text-base">{step.body}</p>

      {step.tools.length > 0 && (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {step.tools.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={`/beekeeping/${tool.slug}`}
                className="group flex h-full items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-2 transition hover:-translate-y-0.5 hover:border-amber-500/40"
              >
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#f6f1e7] sm:h-14 sm:w-14">
                  <img
                    src={tool.image}
                    alt={tool.name}
                    loading="lazy"
                    decoding="async"
                    width={200}
                    height={200}
                    className="h-full w-full object-contain p-1 mix-blend-multiply"
                  />
                </span>
                <span className="min-w-0 font-amiri text-sm font-bold leading-snug text-white group-hover:text-amber-400 sm:text-base">
                  {tool.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {step.media.length > 0 && (
        <figure className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-3 sm:p-4">
          <figcaption className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Camera className="h-3.5 w-3.5" /> هكذا نعمل في مناحل الهيثم
          </figcaption>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {step.media.map((m) => (
              <div key={m.id} className="overflow-hidden rounded-xl border border-zinc-800">
                {m.type === 'VIDEO' ? (
                  <video
                    src={m.url}
                    controls
                    preload="metadata"
                    playsInline
                    className="aspect-video w-full bg-black object-cover"
                  />
                ) : (
                  <img
                    src={m.url}
                    alt={m.caption ?? ''}
                    loading="lazy"
                    decoding="async"
                    className="aspect-video w-full object-cover"
                  />
                )}
                {m.caption && (
                  <p className="bg-zinc-900/70 p-2 text-[11px] text-zinc-400">{m.caption}</p>
                )}
              </div>
            ))}
          </div>
        </figure>
      )}

      {children}
    </li>
  );
}
