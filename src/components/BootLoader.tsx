'use client';

import { useEffect, useState } from 'react';
import { useHydrated } from '@/lib/useHydrated';

const FADE_MS = 420;

/**
 * شاشة الافتتاح: شعار الهيثم يُرسم بخطوط ذهبية مع «جارٍ تحضير الخلية… 🐝».
 * لا مدة مصطنعة: تُخفى فور اكتمال ترطيب React (أي بسرعة تحميل الصفحة نفسها)،
 * لكن بخروج ناعم بدل الاختفاء الفجائي. تظهر مرة واحدة في الجلسة — من يفتح رابط
 * منتج من إنستغرام مباشرة لا ينتظر رسم شعار في كل صفحة (القرار في layout قبل الرسم).
 */
export default function BootLoader() {
  const hydrated = useHydrated();
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem('haytham-booted', '1');
    } catch {
      // التخزين قد يكون معطّلاً
    }
    const t = setTimeout(() => setGone(true), FADE_MS);
    return () => clearTimeout(t);
  }, [hydrated]);

  if (gone) return null;

  return (
    <haytham-loader
      active
      overlay
      theme="dark"
      label="جارٍ تحضير الخلية… 🐝"
      className={hydrated ? 'boot-leaving' : undefined}
      style={
        {
          '--haytham-size': '190px',
          '--haytham-overlay-background': '#09090b',
        } as React.CSSProperties
      }
    />
  );
}
