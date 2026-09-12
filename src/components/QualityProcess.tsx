'use client';

import { motion } from 'framer-motion';
import { Mountain, Microscope, PackageCheck } from 'lucide-react';

/** المعايير الثلاثة من الخلية إلى العبوة — منقولة من قسم الجودة في الموقع الأصلي. */
const FACTORS = [
  {
    icon: Mountain,
    title: 'انتقاء المرعى',
    body: 'نتنقل خلف مواسم الزهور في جبال ووديان سوريا لنقطف أفضل الرحيق وأكثره نقاءً، بعيداً عن ملوثات المدن.',
  },
  {
    icon: Microscope,
    title: 'فحص مخبري مستقل',
    body: 'فحص السكروز، الحموضة، والإنزيمات لتأكل مطمئنًا. نضمن لك النقاء بالدليل العلمي القاطع.',
  },
  {
    icon: PackageCheck,
    title: 'تعبئة آمنة',
    body: 'شروط صحية وتغليف يحافظ على جودة العسل وخصائصه الحيوية. يصلك كما خرج من المنحل تماماً.',
  },
];

export default function QualityProcess() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 px-4 py-16 sm:px-6 sm:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-900/30 to-transparent" />

      <div className="container relative mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center sm:mb-16"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/[0.07] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold tracking-wide text-amber-300">
              من الخلية إلى العبوة
            </span>
          </div>
          <h2 className="mb-4 font-amiri text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            شهادة عملائنا هي فخرنا <span className="gold-text">وإرثنا هو الضمان</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base font-light text-zinc-400 sm:text-lg">
            معايير لا نساوم عليها لأن صحتك هي أمانتنا
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          {FACTORS.map((f, index) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition-colors duration-300 hover:border-amber-500/40 hover:bg-zinc-900/70 sm:p-8"
            >
              <span className="absolute inset-x-0 top-0 mx-auto h-px w-0 bg-gradient-to-l from-transparent via-amber-400 to-transparent transition-all duration-500 group-hover:w-full" />
              <span
                className="absolute top-5 left-5 font-amiri text-3xl font-bold text-amber-500/15 select-none"
                dir="ltr"
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/[0.08] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-amber-500/40 group-hover:bg-amber-500/15">
                <f.icon className="h-7 w-7 text-amber-400" strokeWidth={1.5} />
              </div>

              <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-amber-400 sm:text-xl">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
