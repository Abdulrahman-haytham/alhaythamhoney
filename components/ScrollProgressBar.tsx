import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Isolated scroll progress bar component.
 * Kept separate so useScroll/useSpring don't cause
 * the entire HomePage to re-render on scroll events.
 */
export const ScrollProgressBar: React.FC = React.memo(() => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 origin-[0%] z-[100]"
      style={{ scaleX }}
    />
  );
});
