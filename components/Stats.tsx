
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
    <section className="bg-zinc-950 py-20 px-6 relative border-y border-amber-900/10">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-4">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="text-center md:border-l last:border-l-0 border-amber-900/10 py-6"
          >
            <div className="text-5xl md:text-7xl font-black gold-text mb-2">
              <Counter from={stat.from} to={stat.to} suffix={stat.suffix} />
            </div>
            <div className="text-zinc-500 font-medium tracking-wide text-sm uppercase">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};