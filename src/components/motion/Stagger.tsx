'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { fadeUp, staggerChildren } from '@/lib/motion';

/**
 * حاوية تُظهر أبناءها واحداً تلو الآخر (بطاقات، أيقونات ثقة، أزرار).
 * الأبناء يجب أن يكونوا <StaggerItem>.
 */
export function Stagger({
  children,
  stagger = 0.08,
  delay = 0,
  amount = 0.2,
  ...rest
}: HTMLMotionProps<'div'> & { stagger?: number; delay?: number; amount?: number }) {
  return (
    <motion.div
      data-reveal
      variants={staggerChildren(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount, margin: '0px 0px -8% 0px' }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...rest }: HTMLMotionProps<'div'>) {
  return (
    <motion.div data-reveal variants={fadeUp} {...rest}>
      {children}
    </motion.div>
  );
}
