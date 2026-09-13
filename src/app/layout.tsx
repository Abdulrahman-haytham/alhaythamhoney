import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { SITE } from '@/lib/config';
import { StructuredData } from '@/components/StructuredData';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import SiteShell from '@/components/SiteShell';
import Footer from '@/components/Footer';
import { SettingsProvider } from '@/components/SettingsProvider';
import { getSettings } from '@/lib/settings.server';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: SITE.tagline,
  openGraph: {
    type: 'website',
    locale: 'ar_SY',
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.tagline,
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/haytham-logo-static.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  verification: { google: 'dp5yq2Aivs8gf_ceE2WSpBbhSxNKqOe2vKL1ehwNSLY' },
};

export const viewport: Viewport = { themeColor: '#09090b', viewportFit: 'cover' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // إعدادات لوحة التحكم (واتساب، الشحن، الإعلان…) تُقرأ هنا وتُوزَّع على الخادم والمتصفح
  const settings = await getSettings();
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Amiri:wght@400;700&display=swap"
        />
      </head>
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        <Script src="/haytham-loader.js" strategy="beforeInteractive" />
        <StructuredData />
        <SettingsProvider settings={settings}>
          <SiteShell footer={<Footer />}>{children}</SiteShell>
        </SettingsProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
