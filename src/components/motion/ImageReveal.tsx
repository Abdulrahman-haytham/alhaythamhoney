'use client';

import { motion } from 'framer-motion';
import { EASE, useMotionPrefs } from '@/lib/motion';

/**
 * كشف صورة بقناع ينفتح من اليمين (اتجاه القراءة) مع تكبير خفيف ينحسر — مرة واحدة.
 * يُستخدم في موضعين أو ثلاثة فقط (القصة، الختام)؛ clip-path ليس مركَّباً على GPU
 * في كل المتصفحات، لذا لا يُكرَّر على كل صورة.
 */
export function ImageReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefs = useMotionPrefs();
  if (prefs.reduced || prefs.lowPower) return <div className={className}>{children}</div>;
  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ clipPath: 'inset(0 0 0 100%)' }}
      whileInView={{ clipPath: 'inset(0 0 0 0%)' }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 1.1, ease: EASE, delay }}
    >
      <motion.div
        className="h-full w-full"
        initial={{ scale: 1.12 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 1.4, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
