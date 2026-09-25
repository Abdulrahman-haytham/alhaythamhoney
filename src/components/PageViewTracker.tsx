'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

/**
 * يسجّل زيارة كل صفحة للوحة المؤشرات — يعمل مع التنقّل الداخلي أيضاً
 * (Next لا يعيد تحميل الصفحة، فلا يكفي حدث التحميل الأول).
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);
  return null;
}
