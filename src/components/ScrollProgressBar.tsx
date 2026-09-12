'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/** شريط رفيع أعلى الصفحة يوضح موضع القراءة. */
export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[60] h-0.5 origin-right bg-gradient-to-l from-amber-600 via-amber-400 to-amber-600"
    />
  );
}