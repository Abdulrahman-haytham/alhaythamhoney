import Link from 'next/link';
import { PenLine } from 'lucide-react';
import { SITE } from '@/lib/config';

const dateFmt = new Intl.DateTimeFormat('ar-SY-u-nu-latn', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

/**
 * صندوق المؤلف (E-E-A-T): من كتب المدخل ومتى حُدّث آخر مرة.
 * الأسماء كما في قصة الموقع (`Story.tsx`) — لا نزعم خبرة غير مذكورة هناك.
 */
export function GlossaryAuthorBox({ updatedAt }: { updatedAt: Date }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs text-zinc-400">
      <span className="inline-flex items-center gap-1.5">
        <PenLine className="h-3.5 w-3.5 text-amber-500/80" aria-hidden />
        كتبه{' '}
        <Link href="/about-us" className="font-bold text-zinc-200 hover:text-amber-400">
          عبد الرحمن وتركي
        </Link>
        <span className="hidden sm:inline">
          — نحّالان من الجيل الثاني، مناحل الهيثم منذ {SITE.foundedYear}
        </span>
      </span>
      <span className="text-zinc-600" aria-hidden>
        ·
      </span>
      <span>
        آخر تحديث{' '}
        <time dateTime={updatedAt.toISOString()} className="text-zinc-300">
          {dateFmt.format(updatedAt)}
        </time>
      </span>
    </div>
  );
}
