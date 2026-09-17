'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { normalizeArabic, type GlossaryStage } from '@/lib/glossary';
import { GlossaryCard } from '@/components/glossary/GlossaryCard';
import { StageNav } from './StageNav';

/**
 * غلاف الموسوعة في المتصفح: يملك حقل البحث فقط.
 * بلا بحث → شريط المراحل + أقسام المراحل التي صيّرها الخادم (children).
 * مع بحث → تُخفى الأقسام وتُعرض شبكة نتائج مسطّحة من الـ props نفسها — لا طلب شبكة.
 */
export function GlossaryJourney({
  stages,
  children,
}: {
  stages: GlossaryStage[];
  children: React.ReactNode;
}) {
  const [query, setQuery] = useState('');
  const q = normalizeArabic(query.trim());

  const results = useMemo(() => {
    if (!q) return [];
    return stages.flatMap((s) =>
      s.entries
        .filter((e) =>
          normalizeArabic(`${e.name} ${e.aliases.join(' ')} ${e.summary} ${e.category}`).includes(
            q,
          ),
        )
        .map((e) => ({ entry: e, stage: { index: s.index, name: s.name } })),
    );
  }, [stages, q]);

  return (
    <>
      <div className="relative mx-auto mb-8 max-w-md">
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

      {q ? (
        results.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-500">
            لا نتائج مطابقة لـ «{query}» —{' '}
            <button type="button" onClick={() => setQuery('')} className="text-amber-400 underline">
              أظهر الرحلة كاملة
            </button>
          </p>
        ) : (
          <>
            <p className="mb-4 text-center text-xs text-zinc-500">
              {results.length} نتيجة لـ «{query}»
            </p>
            <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {results.map(({ entry, stage }) => (
                <li key={entry.slug}>
                  <GlossaryCard entry={entry} stage={stage} headingLevel="h2" />
                </li>
              ))}
            </ul>
          </>
        )
      ) : (
        <>
          <StageNav stages={stages.map(({ entries: _e, ...meta }) => meta)} />
          {children}
        </>
      )}
    </>
  );
}
