'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Shield, Sprout, HeartHandshake } from 'lucide-react';

const VALUES = [
  {
    icon: Sprout,
    title: 'أمانة في أعناقنا',
    body: 'النحل ليس سلعة موسمية، إنه كائن حي، وركيزة بيئية.',
  },
  {
    icon: Lightbulb,
    title: 'وعي وتعلّم',
    body: 'ندعو إلى التعلّم بدل التلقّي، وإلى السؤال بدل الانسياق.',
  },
];

const RESPONSIBILITIES = [
  { icon: Lightbulb, label: 'نشر الوعي' },
  { icon: Sprout, label: 'حماية النحل' },
  { icon: Shield, label: 'صون المستهلك' },
];

/** رسالة الهيثم وقيمها — القسم الثاني من صفحة «قصتنا». */
export default function Mission() {
  return (
    <section className="relative overflow-hidden bg-zinc-900 py-16 sm:py-24">
      <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-amber-500/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 translate-y-1/2 -translate-x-1/2 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center sm:mb-10"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/[0.07] px-4 py-1.5">
            <HeartHandshake className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
            <span className="text-xs font-semibold tracking-wide text-amber-300">رسالتنا</span>
          </div>
          <h2 className="font-amiri text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            رسالتنا في الهيثم
          </h2>
        </motion.div>

        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl border border-amber-500/10 bg-zinc-950/50 p-5 sm:rounded-3xl sm:p-8 md:p-10"
          >
            <div className="pointer-events-none absolute top-2 right-4 select-none font-amiri text-6xl leading-none text-amber-500/5 sm:top-4 sm:right-6 sm:text-8xl">
              &quot;
            </div>

            <div className="relative z-10">
              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-10">
                <div className="space-y-4 font-light text-zinc-300">
                  <p className="font-amiri text-xl leading-relaxed text-white sm:text-2xl">
                    في الهيثم نحل وعسل، لا نبيع العسل فقط، بل نرتقي بثقافة المستهلك، ليشتري عن فهم،
                    يميّز بوعي، ويحمي بقناعة.
                  </p>
                  <div className="my-2 h-px w-24 bg-amber-500/30 sm:my-4" />
                  <p className="text-sm leading-relaxed sm:text-base">
                    نؤمن أن الجهل بمنتجات النحل لا يضرّ المستهلك وحده، بل يهدّد النحل، ويقتل الإنتاج
                    النظيف، ويفتح الباب أمام الغشّ، والاستغلال، وتشويه الحقيقة.
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  {VALUES.map((v) => (
                    <div
                      key={v.title}
                      className="group rounded-xl border border-amber-500/10 bg-zinc-900/50 p-3 transition-colors hover:border-amber-500/30 sm:p-4"
                    >
                      <div className="flex gap-3">
                        <div className="mt-1 h-fit rounded-lg border border-amber-500/20 bg-amber-500/[0.08] p-1.5 transition-colors group-hover:bg-amber-500/15">
                          <v.icon
                            className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div>
                          <h3 className="mb-1 text-sm font-bold text-white">{v.title}</h3>
                          <p className="text-xs leading-relaxed text-zinc-400 sm:text-sm">
                            {v.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <p className="mr-1 mt-2 border-r-2 border-amber-500/30 pr-3 text-xs italic text-zinc-400 sm:text-sm">
                    حمايته تبدأ بالوعي، وتستمر بالتعلّم، وتُترجم بدعم المنتج المحلي الحقيقي.
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-white/5 pt-4 sm:mt-8 sm:pt-6">
                <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 md:flex-row">
                  <h3 className="whitespace-nowrap text-xs font-bold uppercase tracking-wider text-amber-500">
                    نحن مسؤولون عن:
                  </h3>
                  <div className="flex w-full flex-wrap justify-center gap-x-4 gap-y-2 font-amiri text-base text-white sm:gap-x-6 sm:text-lg md:justify-end">
                    {RESPONSIBILITIES.map((r) => (
                      <span
                        key={r.label}
                        className="flex items-center gap-1.5 rounded-full border border-white/5 bg-zinc-900/50 px-3 py-1 sm:gap-2"
                      >
                        <r.icon className="h-3.5 w-3.5 text-amber-500 sm:h-4 sm:w-4" />
                        {r.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
