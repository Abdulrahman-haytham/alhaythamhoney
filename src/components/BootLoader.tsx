'use client';

import { useHydrated } from '@/lib/useHydrated';

/**
 * شاشة افتتاح بشعار الهيثم المتحرك — تظهر مرة واحدة عند التحميل الأول للصفحة
 * (لا تظهر مجدداً عند التنقّل بين الصفحات، لأن هذا المكوّن يعيش في التخطيط الجذري).
 * لا يوجد تأخير مقصود: المحتوى مُصيّر على الخادم فعلاً منذ البداية، فالشاشة
 * تُخفى فوراً بمجرد أن يكتمل تحميل React وترطيبه (useEffect عند التركيب) —
 * أي أن مدة ظهورها الفعلية تتبع سرعة تحميل الصفحة نفسها: قصيرة على اتصال
 * سريع، أطول على اتصال بطيء، دون فرض مدة ثابتة.
 */
export default function BootLoader() {
  const visible = !useHydrated();

  if (!visible) return null;

  return (
    <haytham-loader
      active
      overlay
      theme="dark"
      label="جارٍ التحميل…"
      style={
        {
          '--haytham-size': '190px',
          '--haytham-overlay-background': '#09090b',
        } as React.CSSProperties
      }
    />
  );
}
