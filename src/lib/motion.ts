'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * لغة الحركة الواحدة للموقع — كل مكوّن حركة يقرأ من هنا حتى يبقى الإيقاع متسقاً:
 * منحنى واحد (expo-out: يبدأ سريعاً ويهدأ)، ومدد قليلة، ومسافات صغيرة.
 * القاعدة: 80% بساطة فاخرة، 20% حركة — الحركة تُشعَر ولا تُلاحَظ.
 */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const DUR = {
  /** تفاعلات دقيقة (hover) */
  fast: 0.2,
  /** ظهور عنصر */
  base: 0.5,
  /** ظهور قسم أو صورة */
  slow: 0.8,
} as const;

export interface MotionPrefs {
  /** المستخدم فعّل «تقليل الحركة» */
  reduced: boolean;
  /** شاشة ضيقة — مسافات أقصر وبلا parallax */
  mobile: boolean;
  /** جهاز ضعيف أو اتصال موفّر — تُعطَّل الحركات المرتبطة بالتمرير */
  lowPower: boolean;
}

/**
 * تفضيلات الحركة للجهاز الحالي. قبل الترطيب نفترض حاسوباً قادراً؛ القيم الحقيقية
 * تصل في أول effect — وكل ما يعتمد عليها حركات إضافية لا محتوى.
 */
export function useMotionPrefs(): MotionPrefs {
  const reduced = useReducedMotion() ?? false;
  const [env, setEnv] = useState({ mobile: false, lowPower: false });
  useEffect(() => {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () =>
      setEnv({
        mobile: mq.matches,
        lowPower:
          (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
          (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4) ||
          !!nav.connection?.saveData,
      });
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return { reduced, ...env };
}

/** variants مشتركة — تُستخدم مع Stagger */
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.base, ease: EASE } },
};

export const staggerChildren = (stagger = 0.08, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});
