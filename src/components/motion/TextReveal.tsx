'use client';

import { motion } from 'framer-motion';
import { DUR, EASE, useMotionPrefs } from '@/lib/motion';

/**
 * ظهور عنوان كلمةً كلمة (لا حرفاً حرفاً: تقطيع الحروف يفكّ اتصال الخط العربي).
 * كل كلمة تصعد من تحت قناع overflow-hidden — للعناوين الكبيرة فقط، لا للفقرات.
 * `mode="mount"` للـ Hero (يبدأ فوراً)، والافتراضي عند دخول الشاشة.
 */
export function TextReveal({
  text,
  as: Tag = 'span',
  className = '',
  delay = 0,
  stagger = 0.05,
  mode = 'view',
}: {
  text: string;
  as?: 'span' | 'h1' | 'h2' | 'p';
  className?: string;
  delay?: number;
  stagger?: number;
  mode?: 'mount' | 'view';
}) {
  const prefs = useMotionPrefs();
  const words = text.split(/\s+/).filter(Boolean);
  if (prefs.reduced) return <Tag className={className}>{text}</Tag>;
  const animate = { y: '0%', opacity: 1 };
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom" aria-hidden>
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            {...(mode === 'mount'
              ? { animate }
              : { whileInView: animate, viewport: { once: true, amount: 0.6 } })}
            transition={{ duration: DUR.slow, ease: EASE, delay: delay + i * stagger }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}
