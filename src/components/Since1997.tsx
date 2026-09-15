'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { Award, Users, Hexagon } from 'lucide-react';
import { SITE, yearsOfExperience } from '@/lib/config';
import { EASE, useMotionPrefs } from '@/lib/motion';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';

/** عدّاد يبدأ من القيمة النهائية في HTML الخادم (صحيح بلا JS) ثم يعدّ عند الظهور */
function Counter({ target, suffix = '+' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const prefs = useMotionPrefs();
  const [value, setValue] = useState(target);
  useEffect(() => {
    if (!inView || prefs.reduced) return;
    const controls = animate(0, target, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target, prefs.reduced]);
  return (
    <span ref={ref} className="tabular-nums">
      <bdi dir="ltr">
        {value.toLocaleString('en-US')}
        {suffix}
      </bdi>
    </span>
  );
}

/**
 * «منذ 1997» — الرقم الكبير هو المشهد: يصعد من تحت قناع مرة واحدة، والسطر تحته يظهر بعده.
 * سنوات الخبرة تُحسب لا تُكتب. الرقمان الآخران من بيانات الموقع الحالية.
 */
export default function Since1997() {
  const years = yearsOfExperience();
  const prefs = useMotionPrefs();
  const facts = [
    { icon: Award, value: years, label: 'عاماً من الخبرة', hint: `منذ ${SITE.foundedYear}` },
    { icon: Users, value: 1000, label: 'عميل راضٍ', hint: 'في كل المحافظات' },
    { icon: Hexagon, value: 400, label: 'خلية نحل', hint: 'في مراعٍ سورية' },
  ];
  return (
    <section className="relative overflow-hidden bg-zinc-950 py-16 sm:py-24">
      {/* شريط ذهبي خافت يمرّ خلف الرقم — تدرّج لا blur */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-64 -translate-y-1/2"
        style={{
          background:
            'radial-gradient(60% 100% at 50% 50%, rgba(212,175,55,0.10), transparent 70%)',
        }}
      />
      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <span className="mb-2 text-[11px] font-bold uppercase tracking-[0.35em] text-amber-500 sm:text-xs">
            إرث عائلي
          </span>
          {/* المراقبة على الغلاف لا على الرقم: الرقم يبدأ خارج قناع overflow-hidden فلا «يُرى» */}
          <motion.div
            className="overflow-hidden pb-2"
            initial={prefs.reduced ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
          >
            <motion.p
              aria-label={`منذ ${SITE.foundedYear}`}
              variants={{
                hidden: { y: '100%', opacity: 0 },
                show: { y: '0%', opacity: 1, transition: { duration: 1, ease: EASE } },
              }}
              className="gold-text font-amiri text-[6.5rem] font-bold leading-none tracking-tight sm:text-[9rem] lg:text-[12rem]"
            >
              {SITE.foundedYear}
            </motion.p>
          </motion.div>
          <Reveal delay={0.25}>
            <p className="mx-auto max-w-2xl font-amiri text-2xl font-bold leading-snug text-white sm:text-3xl md:text-4xl">
              منذ {SITE.foundedYear} ونحن نحمل خبرة المناحل إلى كل مرطبان.
            </p>
          </Reveal>
        </div>

        <Stagger
          stagger={0.1}
          className="mx-auto mt-12 grid max-w-4xl grid-cols-3 gap-2.5 sm:mt-16 sm:gap-6"
        >
          {facts.map((f) => (
            <StaggerItem
              key={f.label}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/40 px-2 py-5 text-center transition-colors duration-300 hover:border-amber-500/40 sm:rounded-2xl sm:px-6 sm:py-8"
            >
              <div className="mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/[0.08] sm:mb-4 sm:h-12 sm:w-12 sm:rounded-xl">
                <f.icon className="h-4 w-4 text-amber-400 sm:h-6 sm:w-6" strokeWidth={1.5} />
              </div>
              <div className="mb-1.5 text-xl font-extrabold leading-none tracking-tight sm:text-5xl">
                <span className="gold-text">
                  <Counter target={f.value} />
                </span>
              </div>
              <p className="text-[11px] font-semibold leading-snug text-zinc-100 sm:text-base">
                {f.label}
              </p>
              <p className="mt-1 text-[9px] text-zinc-500 sm:text-xs">{f.hint}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
