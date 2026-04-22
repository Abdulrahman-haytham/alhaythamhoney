
import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';

interface CounterProps {
  from: number;
  to: number;
  duration?: number;
  suffix?: string;
}

const Counter: React.FC<CounterProps> = ({ from, to, duration = 2, suffix = "" }) => {
  const [count, setCount] = useState(from);
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const controls = animate(from, to, {
        duration,
        onUpdate(value) {
          setCount(Math.floor(value));
        },
        ease: "easeOut"
      });
      return () => controls.stop();
    }
  }, [from, to, duration, isInView]);

  return <span ref={nodeRef}>{count}{suffix}</span>;
};

export const Stats: React.FC = () => {
  const stats = [
    { label: 'عامًا من الخبرة', from: 0, to: 25, suffix: '+' },
    { label: 'عميل راضٍ', from: 0, to: 1000, suffix: '+' },
    { label: 'خلية نحل مُدارة بعناية', from: 0, to: 400, suffix: '+' },
  ];

  return (
    <section className="bg-zinc-950 py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative border-y border-amber-900/10">
      <div className="container mx-auto grid grid-cols-3 gap-2 sm:gap-6 md:gap-8">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="text-center border-l last:border-l-0 border-amber-900/10 py-3 sm:py-5 md:py-6 min-w-0"
          >
            <div className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-black gold-text mb-1 sm:mb-2 whitespace-nowrap leading-none">
              <Counter from={stat.from} to={stat.to} suffix={stat.suffix} />
            </div>
            <div className="text-zinc-500 font-medium tracking-wide text-[10px] sm:text-sm uppercase px-1 sm:px-2 leading-snug">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
