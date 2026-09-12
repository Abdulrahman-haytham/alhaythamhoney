import type { Metadata } from 'next';
import { BadgeCheck } from 'lucide-react';
import QualityProcess from '@/components/QualityProcess';
import QualityGuarantees from '@/components/QualityGuarantees';

export const metadata: Metadata = {
  title: 'معايير الجودة',
  description:
    'نلتزم بأعلى معايير الجودة في إنتاج العسل: انتقاء المرعى، فحص مخبري مستقل، وتعبئة آمنة. عسل طبيعي 100% مفحوص ومكفول.',
  alternates: { canonical: '/quality-standards' },
};

export default function QualityStandardsPage() {
  return (
    <>
      <section className="bg-zinc-950 px-4 pt-32 sm:px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
            <BadgeCheck className="h-7 w-7 text-amber-500" strokeWidth={1.5} />
          </div>
          <h1 className="mb-4 font-amiri text-3xl font-bold text-white sm:text-4xl md:text-5xl">معايير الجودة</h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            عسل مفحوص مخبرياً ومكفول — من مرعى مختار إلى عبوة محكمة، بلا وسطاء ولا إضافات.
          </p>
        </div>
      </section>

      <QualityProcess />
      <QualityGuarantees />
    </>
  );
}
