import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import Story from '@/components/Story';
import Mission from '@/components/Mission';
import Stats from '@/components/Stats';
import { SITE } from '@/lib/config';

export const metadata: Metadata = {
  title: 'قصتنا',
  description:
    'تعرف على حكاية عسل الهيثم. إرث عائلي في تربية النحل وإنتاج العسل الطبيعي في سوريا منذ عام 1997، بإدارة أبناء الوالد المؤسس.',
  alternates: { canonical: '/about-us' },
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-zinc-950 px-4 pt-32 sm:px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
            <BookOpen className="h-7 w-7 text-amber-500" strokeWidth={1.5} />
          </div>
          <h1 className="mb-4 font-amiri text-3xl font-bold text-white sm:text-4xl md:text-5xl">قصتنا</h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            إرث عائلي في تربية النحل منذ {SITE.foundedYear} — حين يكون العسل مسؤولية قبل أن يكون تجارة.
          </p>
        </div>
      </section>

      <Story />
      <Mission />
      <Stats />
    </>
  );
}
