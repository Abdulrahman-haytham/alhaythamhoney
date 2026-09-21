'use client';

import Link from 'next/link';
import { Reveal } from '@/components/motion/Reveal';
import { Award, ShieldCheck, FileCheck, CheckCircle2, ArrowLeft } from 'lucide-react';

/** بطاقات الضمانات — منقولة من قسم «شهادات الجودة والضمانات» في الموقع الأصلي. */
const GUARANTEES = [
  { icon: FileCheck, title: 'شهادة الفحص المخبري', body: 'فحص شامل للجودة والنقاء' },
  { icon: ShieldCheck, title: 'عسل طبيعي 100%', body: 'موثق ومضمون الجودة' },
  { icon: Award, title: 'خبرة 25+ عاماً', body: 'إرث عائلي موثوق' },
  { icon: CheckCircle2, title: 'ضمان الجودة', body: 'نضمن رضاكم أو استرداد المال' },
];

const BADGES = ['ضمان الجودة', 'استرداد المال', 'شحن آمن'];

export default function QualityGuarantees() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900/50 to-zinc-950 px-4 py-16 sm:px-6 sm:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      <div className="pointer-events-none absolute top-20 right-20 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-20 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="container relative z-10 mx-auto">
        <Reveal className="mb-12 text-center sm:mb-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/[0.07] px-4 py-1.5">
            <Award className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
            <span className="text-xs font-semibold tracking-wide text-amber-300">
              الشهادات والضمانات
            </span>
          </div>
          <h2 className="mb-4 font-amiri text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            شهادات الجودة والضمانات
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            ثقتكم هي أمانتنا — نضع اسمنا ضماناً لكل قطرة عسل
          </p>
        </Reveal>

        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {GUARANTEES.map((g, index) => (
            <Reveal
              delay={index * 0.08}
              key={g.title}
              className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 p-4 text-center transition-all duration-300 hover:border-amber-500/50 sm:p-6"
            >
              <span className="absolute inset-x-0 top-0 mx-auto h-px w-0 bg-gradient-to-l from-transparent via-amber-400 to-transparent transition-all duration-500 group-hover:w-full" />
              <span className="pointer-events-none absolute top-0 right-0 h-10 w-10 rounded-tr-2xl border-t border-r border-amber-500/20" />
              <span className="pointer-events-none absolute bottom-0 left-0 h-10 w-10 rounded-bl-2xl border-b border-l border-amber-500/20" />

              <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/[0.08] transition-colors duration-300 group-hover:border-amber-500/40 group-hover:bg-amber-500/15 sm:mb-4 sm:h-14 sm:w-14">
                <g.icon className="h-6 w-6 text-amber-400 sm:h-7 sm:w-7" strokeWidth={1.5} />
              </div>
              <h3 className="mb-1 font-amiri text-base font-bold text-white transition-colors group-hover:text-amber-400 sm:text-xl">
                {g.title}
              </h3>
              <p className="text-[11px] leading-relaxed text-zinc-400 sm:text-sm">{g.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal
          delay={0.3}
          className="mx-auto mt-12 max-w-4xl rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 p-6 text-center sm:mt-16 sm:p-8"
        >
          <h3 className="mb-4 font-amiri text-2xl font-bold text-white">ضمان الجودة الكامل</h3>
          <p className="mb-6 text-base text-zinc-300 sm:text-lg">
            نضمن أن كل منتج من منتجاتنا هو 100% عسل طبيعي مفحوص مخبرياً.
            <br />
            <span className="font-bold text-amber-400">
              إذا لم تكن راضياً عن الجودة، نعيد لك المال كاملاً.
            </span>
          </p>
          <div className="mb-6 flex flex-wrap justify-center gap-4 text-sm text-zinc-400">
            {BADGES.map((b) => (
              <span key={b} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-amber-500" />
                {b}
              </span>
            ))}
          </div>
          <Link
            href="/return-policy"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-500 transition-colors hover:text-amber-400"
          >
            اقرأ سياسة الاسترجاع كاملة
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
