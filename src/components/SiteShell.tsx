'use client';
import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import ReferralCapture from '@/components/ReferralCapture';
import CartSync from '@/components/CartSync';
import PageViewTracker from '@/components/PageViewTracker';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import BootLoader from '@/components/BootLoader';
import ScrollProgressBar from '@/components/ScrollProgressBar';
import CartToast from '@/components/CartToast';
import CartReminder from '@/components/CartReminder';

export default function SiteShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const minimal = pathname.startsWith('/admin') || pathname.startsWith('/q/');
  return (
    <>
      <Suspense fallback={null}>
        <ReferralCapture />
      </Suspense>
      <CartSync />
      <PageViewTracker />
      {!minimal && (
        <>
          <BootLoader />
          <ScrollProgressBar />
          <Header />
        </>
      )}
      {/* `min-h-screen`: الهيكل يصل المتصفح قبل محتوى الصفحة أثناء البثّ، فلولا هذا
          الحجز لرُسم التذييل في منتصف الشاشة ثم قفز لأسفل — وهو ما يقيسه كروم كـ CLS. */}
      <main
        id="main-content"
        tabIndex={-1}
        className={
          minimal ? '' : 'min-h-screen pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0'
        }
      >
        {children}
      </main>
      {!minimal && (
        <>
          {footer}
          <BottomNav />
          <CartToast />
          <CartReminder />
        </>
      )}
    </>
  );
}
