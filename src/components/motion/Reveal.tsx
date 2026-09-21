'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * ظهور عند التمرير بلا مكتبة: IntersectionObserver يضبط `data-reveal` والانتقال في CSS.
 * بديل `motion.div whileInView` الذي كان يجرّ framer-motion كاملة (~١٢٠ كيلوبايت) إلى كل صفحة.
 * بلا JavaScript يبقى العنصر مرئياً (القاعدة في globals.css مشروطة بـ `html[data-js]`).
 */
export function Reveal({
  as = 'div',
  delay = 0,
  className,
  children,
  ...rest
}: {
  as?: 'div' | 'section' | 'article' | 'li' | 'p' | 'header' | 'figure';
  /** تأخير بالثواني — للعناصر المتتالية */
  delay?: number;
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, 'className' | 'children'>) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -60px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // وسم HTML من اسمه (لا مكوّن يُنشأ أثناء التصيير) — الـref يُمرَّر كخاصية JSX عادية
  const Tag = as as 'div';
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      data-reveal={seen ? 'in' : 'out'}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
