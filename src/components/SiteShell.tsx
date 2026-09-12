'use client';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import BootLoader from '@/components/BootLoader';
import ScrollProgressBar from '@/components/ScrollProgressBar';

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
      {!minimal && (
        <>
          <BootLoader />
          <ScrollProgressBar />
          <Header />
        </>
      )}
      <main
        id="main-content"
        tabIndex={-1}
        className={minimal ? '' : 'pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0'}
      >
        {children}
      </main>
      {!minimal && (
        <>
          {footer}
          <BottomNav />
        </>
      )}
    </>
  );
}
