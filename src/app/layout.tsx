import type { Metadata, Viewport } from 'next';
import { Cairo, Amiri } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { SITE } from '@/lib/config';
import { StructuredData } from '@/components/StructuredData';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import SiteShell from '@/components/SiteShell';
import Footer from '@/components/Footer';
import { SettingsProvider } from '@/components/SettingsProvider';
import { getSettings } from '@/lib/settings.server';
import { CustomerProvider } from '@/components/CustomerProvider';

/**
 * الخطوط تُستضاف معنا لا من fonts.gstatic: كانت ٣٠٦ كيلوبايت على المسار الحرج
 * مع اتصال إضافي بنطاق ثالث. `subsets: arabic` يقصّ ما لا نحتاجه، و`display: swap`
 * يرسم النص بخط احتياطي فوراً بدل أن يحجبه.
 */
const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '600', '700', '900'],
  display: 'swap',
  variable: '--font-cairo-src',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

const amiri = Amiri({
  subsets: ['arabic'],
  // الوزن الثقيل وحده: ١٤٠ من ١٤٨ استعمالاً لهذا الخط عناوين بـ font-bold،
  // وإسقاط الوزن العادي يوفّر نحو ١٠٠ كيلوبايت من المسار الحرج للعنوان الرئيسي.
  weight: ['700'],
  display: 'swap',
  variable: '--font-amiri-src',
  fallback: ['ui-serif', 'Georgia', 'serif'],
});

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
  // إعدادات لوحة التحكم (واتساب، الشحن، الإعلان…) تُقرأ هنا وتُوزَّع على الخادم والمتصفح.
  // لا تُقرأ الكوكي هنا عمداً — انظر CustomerProvider.
  const settings = await getSettings();
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${amiri.variable}`}>
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        <Script src="/haytham-loader.js" strategy="beforeInteractive" />
        <StructuredData />
        <SettingsProvider settings={settings}>
          <CustomerProvider>
            <SiteShell footer={<Footer />}>{children}</SiteShell>
          </CustomerProvider>
        </SettingsProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
