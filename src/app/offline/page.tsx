import type { Metadata } from 'next';
import { WifiOff } from 'lucide-react';

export const metadata: Metadata = {
  title: 'لا يوجد اتصال',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-32 pb-16 px-4 bg-zinc-950">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-8 h-8 text-amber-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-white mb-4">
          لا يوجد اتصال بالإنترنت
        </h1>
        <p className="text-zinc-400 leading-relaxed">
          تعذّر الوصول إلى الشبكة. الصفحات التي زرتها سابقاً ما تزال متاحة، وسيعود الموقع كاملاً
          فور استعادة الاتصال.
        </p>
      </div>
    </section>
  );
}