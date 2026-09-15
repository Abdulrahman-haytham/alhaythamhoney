'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useMotionPrefs } from '@/lib/motion';

/**
 * طبقة تتحرك بمقدار صغير مع التمرير (خلفية Hero، مرطبان). الحاسوب فقط:
 * على الجوال أو مع تقليل الحركة أو الأجهزة الضعيفة تُصيَّر ثابتة — transform فقط، بلا layout.
 */
export function ParallaxLayer({
  children,
  distance = 40,
  className = '',
}: {
  children: React.ReactNode;
  /** المسافة الكلية بالبكسل من أول ظهور إلى آخره */
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefs = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-distance / 2, distance / 2]);
  const active = !prefs.reduced && !prefs.mobile && !prefs.lowPower;
  return (
    <motion.div ref={ref} style={active ? { y } : undefined} className={className}>
      {children}
    </motion.div>
  );
}
