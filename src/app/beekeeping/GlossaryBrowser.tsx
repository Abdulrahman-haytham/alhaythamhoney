'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Lightbulb, Search, X } from 'lucide-react';
import type { GlossaryCard } from '@/lib/glossary.server';

/** تطبيع عربي بسيط: يتجاهل التشكيل واختلاف الألف والهمزة والتاء المربوطة. */
const normalize = (s: string) =>
  s
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase();

/**
 * تصفّح الموسوعة: تصنيفات + بحث فوري داخل الصفحة نفسها.
 * الفهرس صغير فيُرسَل كاملاً من الخادم (كل المداخل في HTML الأولي = مقروءة لمحرّكات البحث
 * وتعمل بلا JavaScript)، والفلترة تحدث في المتصفح بلا أي طلب شبكة.
 */
export function GlossaryBrowser({
  entries,
  categories,
}: {
  entries: GlossaryCard[];
  categories: string[];
}) {
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    const q = normalize(query.trim());
    return entries.filter(
      (e) =>
        (!category || e.category === category) &&
        (!q || normalize(`${e.name} ${e.summary} ${e.category}`).includes(q)),
    );
  }, [entries, category, query]);

  return (
    <>
      <div className="mb-8 space-y-4">
        <div className="relative mx-auto max-w-md">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            aria-label="ابحث في الموسوعة"
            placeholder="ابحث عن أداة… (مدخّن، حاجز ملكة، فرّاز)"
            className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900/60 pr-10 pl-9 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="مسح البحث"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={`rounded-full border px-4 py-1.5 text-xs transition ${
              category === null
                ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            الكل ({entries.length})
          </button>
          {categories.map((c) => {
            const count = entries.filter((e) => e.category === c).length;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c === category ? null : c)}
                className={`rounded-full border px-4 py-1.5 text-xs transition ${
                  category === c
                    ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}
              >
                {c} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500">
          لا نتائج مطابقة —{' '}
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory(null);
            }}
            className="text-amber-400 underline"
          >
            أظهر الكل
          </button>
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/beekeeping/${e.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:bg-zinc-900/70"
              >
                <div className="relative aspect-square overflow-hidden bg-white">
                  <img
                    src={e.image}
                    alt={e.name}
                    loading="lazy"
                    width={700}
                    height={700}
                    className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  {e.hasTip && (
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-zinc-950/85 px-2 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-amber-500/40">
                      <Lightbulb className="h-3 w-3" /> نصيحة
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <span className="mb-1 text-[10px] font-bold text-amber-500/80">{e.category}</span>
                  <h2 className="font-amiri text-base font-bold leading-snug text-white transition-colors group-hover:text-amber-400 sm:text-lg">
                    {e.name}
                  </h2>
                  <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-zinc-500 sm:text-[13px]">
                    {e.summary}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
