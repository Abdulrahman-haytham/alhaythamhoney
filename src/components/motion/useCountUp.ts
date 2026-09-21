'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * عدّاد يصعد إلى الرقم حين يدخل العنصر الشاشة — requestAnimationFrame بدل `animate()`.
 * القيمة النهائية هي الحالة الأولى فيظهر الرقم صحيحاً في HTML الخادم وبلا JavaScript.
 */
export function useCountUp(target: number, duration = 1600) {
  const ref = useRef<HTMLElement>(null);
  const [value, setValue] = useState(target);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          // منحنى خروج سريع ثم تباطؤ — يشبه إحساس العدّاد القديم
          const eased = 1 - Math.pow(1 - t, 4);
          setValue(Math.round(target * eased));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { rootMargin: '-80px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  return { ref, value };
}
