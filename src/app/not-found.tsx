import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, Store, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'الصفحة غير موجودة',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-32 pb-16 px-4 bg-zinc-950">
      <div className="text-center max-w-lg">
        <p className="text-7xl sm:text-8xl font-black gold-text mb-6 tabular-nums">404</p>
        <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-white mb-4">
          لم نعثر على هذه الصفحة
        </h1>
        <p className="text-zinc-400 mb-10 leading-relaxed">
          ربما تغيّر الرابط أو حُذفت الصفحة. يمكنك العودة إلى الرئيسية أو تصفّح المتجر.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 py-3 px-6 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20"
          >
            <Home className="w-5 h-5" />
            الصفحة الرئيسية
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-3 px-6 rounded-xl font-bold transition-all"
          >
            <Store className="w-5 h-5" />
            المتجر
          </Link>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-3 px-6 rounded-xl font-bold transition-all"
          >
            <Search className="w-5 h-5" />
            المدونة
          </Link>
        </div>
      </div>
    </section>
  );
}