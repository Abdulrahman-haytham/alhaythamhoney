'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { DUR, EASE, useMotionPrefs } from '@/lib/motion';

type Props = HTMLMotionProps<'div'> & {
  /** تأخير بالثواني — للعناصر المتتابعة داخل قسم واحد */
  delay?: number;
  /** مسافة الصعود بالبكسل (تُنصَّف على الجوال) */
  y?: number;
  /** نسبة العنصر التي يجب أن تدخل الشاشة قبل الظهور */
  amount?: number;
  once?: boolean;
};

/**
 * الظهور عند التمرير — المكوّن الوحيد الذي يجب أن تستخدمه الأقسام بدل تكرار whileInView.
 * يُرسل من الخادم بحالة «مخفي» (opacity 0) ويظهر حين يدخل الشاشة؛ ومع تعطيل JavaScript
 * يظهر كل شيء فوراً عبر <noscript> في layout — فلا محتوى يعتمد على الحركة.
 */
export function Reveal({ children, delay = 0, y = 24, amount = 0.2, once = true, ...rest }: Props) {
  const prefs = useMotionPrefs();
  return (
    <motion.div
      data-reveal
      initial={{ opacity: 0, y: prefs.mobile ? y / 2 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount, margin: '0px 0px -8% 0px' }}
      transition={{ duration: DUR.slow, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
