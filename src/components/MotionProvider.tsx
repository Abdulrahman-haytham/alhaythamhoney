'use client';

import { MotionConfig } from 'framer-motion';

/** يحترم «تقليل الحركة» على مستوى كل حركات framer-motion دفعة واحدة */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
