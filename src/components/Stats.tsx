'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, animate } from 'framer-motion';
import { Award, Users, Hexagon } from 'lucide-react';

interface StatItem {
  icon: React.ElementType;
  value: number;
  label: string;
  hint: string;
}

const STATS: StatItem[] = [
  {
    icon: Award,
    value: 25,
    // التنوين على الألف لا على الميم — على الميم يلتبس بحرف القاف في خط Cairo
    label: 'عاماً من الخبرة',
    hint: 'منذ 1997',
  },
  {
    icon: Users,
    value: 1000,
    label: 'عميل راضٍ',
    hint: 'في كل المحافظات',
  },
  {
    icon: Hexagon,
    value: 400,
    label: 'خلية نحل',
    hint: 'في مراعٍ سورية',
  },
];

function AnimatedCounter({ target }: { target: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: '-80px' });
  const reduceMotion = useReducedMotion();
  // القيمة النهائية هي الحالة الأولى، فيظهر الرقم صحيحاً في HTML الخادم وبدون JS
  const [displayValue, setDisplayValue] = useState(target);
  useEffect(() => {
    if (!isInView || reduceMotion) return;
    const controls = animate(0, target, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplayValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, target, reduceMotion]);

  return (
    <span ref={nodeRef} className="tabular-nums">
      {/* عزل ثنائي الاتجاه: يبقي الرقم وعلامة + بترتيب «400+» بدل «+400» */}
      <bdi dir="ltr">{displayValue.toLocaleString('en-US')}+</bdi>
    </span>
  );
}

export default function Stats() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[28rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/[0.04] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/[0.07] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold tracking-wide text-amber-300">أرقامنا</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            أرقام تتحدث عن <span className="gold-text">جودة عسل الهيثم</span>
          </h2>
          <p className="mx-auto max-w-xl text-base text-zinc-400 sm:text-lg">
            أرقام نفتخر بها تعكس التزامنا بتقديم أجود أنواع العسل الطبيعي لعملائنا
          </p>
        </motion.div>

        {/* ثلاثة أعمدة دائماً — حتى على أضيق الشاشات — مع تصغير الحشو والخط بدل التكديس رأسياً */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-6">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.55, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 px-2 py-5 text-center transition-colors duration-300 hover:border-amber-500/40 hover:bg-zinc-900/70 sm:rounded-2xl sm:px-6 sm:py-8"
            >
              {/* خط ذهبي علوي يتمدد عند المرور */}
              <span className="absolute inset-x-0 top-0 mx-auto h-px w-0 bg-gradient-to-l from-transparent via-amber-400 to-transparent transition-all duration-500 group-hover:w-full" />

              <div className="mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/[0.08] transition-colors duration-300 group-hover:border-amber-500/40 group-hover:bg-amber-500/15 sm:mb-5 sm:h-12 sm:w-12 sm:rounded-xl">
                <stat.icon className="h-4.5 w-4.5 text-amber-400 sm:h-6 sm:w-6" strokeWidth={1.5} />
              </div>

              <div className="mb-1.5 text-xl font-extrabold leading-none tracking-tight sm:mb-2 sm:text-5xl">
                <span className="gold-text">
                  <AnimatedCounter target={stat.value} />
                </span>
              </div>

              <p className="text-[11px] font-semibold leading-snug text-zinc-100 sm:text-base">
                {stat.label}
              </p>
              <p className="mt-1 text-[9px] text-zinc-500 sm:text-xs">{stat.hint}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
