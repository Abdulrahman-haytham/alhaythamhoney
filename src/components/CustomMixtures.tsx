'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Crown, Hexagon, Sunrise, SlidersHorizontal, ArrowLeft } from 'lucide-react';

interface CustomMixturesProps {
  isTeaser?: boolean;
}

// الخلطات الثلاث الحقيقية — تطابق بذور قاعدة البيانات (prisma/seed.ts)
const MIXTURES = [
  {
    slug: 'royal',
    name: 'الملكية',
    tagline: 'للحيوية والتركيز',
    icon: Crown,
    description: 'غذاء ملكات + جنسنغ كوري أحمر + طلع النخيل، في قاعدة من عسلك المفضّل.',
  },
  {
    slug: 'whole-hive',
    name: 'الخليّة الكاملة',
    tagline: 'درعك المناعي',
    icon: Hexagon,
    description: 'عسل وعكبر وغبار طلع وغذاء ملكات مع لمسة زنجبيل — كل الخلية في مرطبان.',
  },
  {
    slug: 'morning',
    name: 'صباح الهيثم',
    tagline: 'فطور الملوك كل يوم',
    icon: Sunrise,
    description: 'مكسرات مختارة مغمورة بالعسل. للمتعة والطعم وطاقة الصباح.',
  },
];

export function CustomMixtures({ isTeaser }: CustomMixturesProps) {
  return (
    <section className="relative overflow-hidden bg-zinc-900 py-16 sm:py-24">
      <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-amber-900/30 to-transparent" />
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-amber-900/30 to-transparent" />
      <div className="absolute top-1/2 left-0 h-32 w-32 -translate-y-1/2 rounded-full bg-amber-500/5 blur-3xl" />
      <div className="absolute top-1/2 right-0 h-32 w-32 -translate-y-1/2 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 text-right"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/[0.07] px-4 py-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-semibold tracking-wide text-amber-300">
                الخلطات الخاصة
              </span>
            </div>

            <h2 className="mb-6 font-amiri text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
              وصفة الخبير… <br />
              <span className="text-amber-500">وقرار عسلك لك</span>
            </h2>

            <div className="space-y-5 text-lg font-light leading-relaxed text-zinc-300">
              <p>
                ثلاث خلطات ضبط جرعاتها نحّال بخبرة 25 عاماً. تختار أنت عسلك الأساسي وحجم المرطبان —
                وإن أردت، تعدّل أي مكوّن ضمن حدوده الآمنة.
              </p>
              <p className="text-zinc-400">والسعر يظهر أمامك فوراً مع تفصيله، قبل أن تطلب.</p>
            </div>

            {isTeaser && (
              <div className="mt-8">
                <Link
                  href="/custom-mixtures"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-amber-500 px-8 py-4 font-bold text-zinc-900 shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-105 hover:bg-amber-400 sm:w-auto"
                >
                  <span>صمّم خلطتك</span>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </div>
            )}
          </motion.div>

          <div className="order-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {MIXTURES.map((item, idx) => (
              <motion.div
                key={item.slug}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={idx === 2 ? 'sm:col-span-2' : ''}
              >
                <Link
                  href={`/custom-mixtures/${item.slug}`}
                  className="group block h-full rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 transition-colors group-hover:bg-amber-500/10">
                    <item.icon className="h-6 w-6 text-amber-500" strokeWidth={1.5} />
                  </div>
                  <p className="mb-1 text-[11px] font-bold tracking-wide text-amber-500">
                    {item.tagline}
                  </p>
                  <h3 className="mb-2 font-amiri text-xl font-bold text-white group-hover:text-amber-300">
                    {item.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-400">{item.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
