'use client';

import { useEffect, useRef } from 'react';

/**
 * شريط رفيع أعلى الصفحة يوضح موضع القراءة.
 * يكتب `scaleX` مباشرة على العنصر عبر ref (لا حالة React ولا مكتبة حركة)،
 * والنعومة من انتقال CSS قصير بدل نابض framer-motion.
 */
export default function ScrollProgressBar() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ transform: 'scaleX(0)' }}
      className="fixed top-0 left-0 right-0 z-[60] h-0.5 origin-right bg-gradient-to-l from-amber-600 via-amber-400 to-amber-600 transition-transform duration-100 ease-linear motion-reduce:transition-none"
    />
  );
}
