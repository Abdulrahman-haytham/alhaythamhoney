'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

/** بديل ErrorBoundary العربي — يلتقط أخطاء العرض داخل التخطيط الجذري. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="min-h-screen flex items-center justify-center pt-32 pb-16 px-4 bg-zinc-950">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-amber-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-white mb-4">
          حدث خطأ غير متوقع
        </h1>
        <p className="text-zinc-400 mb-2 leading-relaxed">
          نعتذر عن الإزعاج. يمكنك إعادة المحاولة، وإن تكرر الخطأ تواصل معنا مباشرة.
        </p>
        {error.digest && (
          <p className="text-zinc-600 text-xs mb-8 tabular-nums">رمز الخطأ: {error.digest}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 py-3 px-6 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20"
          >
            <RotateCcw className="w-5 h-5" />
            إعادة المحاولة
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-3 px-6 rounded-xl font-bold transition-all"
          >
            <Home className="w-5 h-5" />
            الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </section>
  );
}
