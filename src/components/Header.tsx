'use client';

import { useEffect, useState } from 'react';
import { useHydrated } from '@/lib/useHydrated';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Award,
  Truck,
  Store,
  Menu,
  X,
  ShoppingCart,
  Heart,
  Camera,
  Search,
  Megaphone,
  UserRound,
  Gift,
} from 'lucide-react';
import { SITE, getWhatsAppLink } from '@/lib/config';
import { useCart } from '@/store/cartStore';
import { useWishlist } from '@/store/wishlistStore';
import { useSettings } from '@/components/SettingsProvider';
import { SearchDialog } from '@/components/SearchDialog';
import { useCustomer } from '@/components/CustomerProvider';

function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-[200] focus:bg-amber-500 focus:text-zinc-950 focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:shadow-lg"
      aria-label="انتقل إلى المحتوى الرئيسي"
    >
      انتقل إلى المحتوى الرئيسي
    </a>
  );
}

/** رأس الموقع — ثابت (fixed) لأن صفحات مثل /contact تحسب مساحته عبر pt-32. */
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const settings = useSettings();
  const customer = useCustomer();
  const mounted = useHydrated();
  const pathname = usePathname();
  const router = useRouter();
  const { getTotalItems } = useCart();
  const wishlistCount = useWishlist((s) => s.items.length);

  // العدّادات من localStorage — تُصفَّر قبل الترطيب لتفادي عدم التطابق
  const cartCount = mounted ? getTotalItems() : 0;
  const savedCount = mounted ? wishlistCount : 0;

  // اختصار لوحة المفاتيح للبحث (Ctrl/⌘ + K) كما في المتاجر الحديثة
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <>
      <SkipLink />

      <header className="fixed top-0 left-0 w-full z-50">
        {/* شريط الإعلان (من لوحة التحكم) يحلّ محلّ شريط الثقة عند تفعيله — نفس الارتفاع فلا يقفز التخطيط */}
        {settings.announcementEnabled && settings.announcementText ? (
          <div className="bg-amber-500 py-1.5 sm:py-2 px-3 sm:px-4 text-[11px] sm:text-xs md:text-sm font-bold text-zinc-950">
            {settings.announcementLink ? (
              <Link
                href={settings.announcementLink}
                className="container mx-auto flex items-center justify-center gap-2 hover:underline"
              >
                <Megaphone className="w-4 h-4 shrink-0" />
                <span className="truncate">{settings.announcementText}</span>
              </Link>
            ) : (
              <p className="container mx-auto flex items-center justify-center gap-2">
                <Megaphone className="w-4 h-4 shrink-0" />
                <span className="truncate">{settings.announcementText}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="bg-black border-b border-amber-900/30 py-1.5 sm:py-2 px-3 sm:px-4 text-[10px] sm:text-xs md:text-sm font-light tracking-wide overflow-hidden">
            {/* عرض متحرك للجوال */}
            <div className="md:hidden w-full relative">
              <div className="animate-marquee whitespace-nowrap">
                <div className="inline-flex items-center gap-1.5 mx-3 text-amber-200/80">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>طبيعي 100% ومفحوص مخبرياً</span>
                </div>
                <div className="inline-flex items-center gap-1.5 mx-3 text-amber-200/80">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>خبرة عائلية +25 عاماً</span>
                </div>
                <div className="inline-flex items-center gap-1.5 mx-3 text-amber-200/80">
                  <Truck className="w-3.5 h-3.5 text-amber-500" />
                  <span>شحن آمن لكافة المحافظات السورية</span>
                </div>
              </div>
            </div>

            {/* عرض ثابت لسطح المكتب */}
            <div className="hidden md:flex container mx-auto justify-center items-center gap-8 text-amber-200/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>طبيعي 100% ومفحوص مخبرياً</span>
              </div>
              <div className="w-px h-4 bg-amber-900/50"></div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>خبرة عائلية +25 عاماً</span>
              </div>
              <div className="w-px h-4 bg-amber-900/50"></div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">شحن آمن لكافة المحافظات السورية</span>
                <span className="sm:hidden">شحن آمن</span>
              </div>
            </div>
          </div>
        )}

        {/* التنقل الرئيسي */}
        <nav
          className="bg-zinc-950/80 backdrop-blur-md border-b border-amber-900/20 py-1.5 sm:py-2 px-3 sm:px-4 md:px-6"
          aria-label="التنقل الرئيسي"
        >
          <div className="container mx-auto flex justify-between items-center">
            {/* الشعار */}
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex items-center gap-2 sm:gap-3 md:gap-4 hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="الهيثم — نحل وعسل - الصفحة الرئيسية"
            >
              <img
                src="/images/logo.webp"
                alt="لوغو الهيثم"
                width={64}
                height={64}
                fetchPriority="high"
                loading="eager"
                className="h-10 sm:h-12 md:h-16 w-auto object-contain brightness-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]"
              />
              <div className="flex flex-col border-r border-zinc-800 pr-2 sm:pr-3 md:pr-4 mr-1 sm:mr-2">
                <span className="text-lg sm:text-xl md:text-2xl font-amiri font-bold gold-text leading-tight">
                  الهيثم
                </span>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-zinc-500 tracking-[0.15em] sm:tracking-[0.2em] uppercase font-bold">
                  نحل وعسل
                </span>
              </div>
            </Link>

            {/* روابط سطح المكتب */}
            <div className="hidden md:flex gap-6 xl:gap-8 text-sm font-medium text-zinc-400">
              <Link
                href="/shop"
                className="flex items-center gap-2 hover:text-amber-500 transition-colors"
              >
                <Store className="w-4 h-4" />
                المتجر
              </Link>
              <Link href="/studio" className="hover:text-amber-500 transition-colors">
                الاستديو
              </Link>
              <Link href="/articles" className="hover:text-amber-500 transition-colors">
                المدونة
              </Link>
              <Link href="/custom-mixtures" className="hover:text-amber-500 transition-colors">
                الخلطات الخاصة
              </Link>
              <Link
                href="/draw"
                className="flex items-center gap-1.5 text-amber-400/90 hover:text-amber-300 transition-colors"
              >
                <Gift className="w-4 h-4" />
                السحب
              </Link>
              <Link href="/about-us" className="hover:text-amber-500 transition-colors">
                قصتنا
              </Link>
              <Link href="/quality-standards" className="hover:text-amber-500 transition-colors">
                الجودة
              </Link>
              <Link href="/faq" className="hover:text-amber-500 transition-colors">
                الأسئلة الشائعة
              </Link>
            </div>

            {/* أيقونات الإجراءات + الدعوة لاتخاذ إجراء */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* البحث */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2.5 text-zinc-400 hover:text-amber-500 hover:bg-zinc-900 rounded-lg transition-colors"
                aria-label="البحث في الموقع"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* الحساب */}
              <Link
                href={customer ? '/account' : '/account/login'}
                className={`relative p-2.5 rounded-lg transition-colors hover:bg-zinc-900 ${customer ? 'text-amber-400' : 'text-zinc-400 hover:text-amber-500'}`}
                aria-label={customer ? `حسابي (${customer.name})` : 'تسجيل الدخول'}
              >
                <UserRound className="w-5 h-5" />
                {customer && (
                  <span className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-green-400 ring-2 ring-zinc-950" />
                )}
              </Link>

              {/* المفضلة */}
              <Link
                href="/wishlist"
                className="relative p-2.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors"
                aria-label={`المفضلة (${savedCount} عنصر)`}
              >
                <Heart className="w-5 h-5" />
                {savedCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {savedCount > 9 ? '9+' : savedCount}
                  </span>
                )}
              </Link>

              {/* السلة */}
              <Link
                href="/cart"
                className="relative p-2.5 text-zinc-400 hover:text-amber-500 hover:bg-zinc-900 rounded-lg transition-colors"
                aria-label={`سلة الطلبات (${cartCount} عنصر)`}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-zinc-950 text-[10px] font-black rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* دعوة واتساب (سطح المكتب) */}
              <a
                href={getWhatsAppLink(SITE.whatsappDefaultMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:block px-4 lg:px-6 py-1.5 lg:py-2 gold-gradient rounded-full text-zinc-950 text-xs lg:text-sm font-black luxury-shadow hover:scale-105 transition-transform"
              >
                اطلب الآن
              </a>

              {/* زر قائمة الجوال */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 text-zinc-400 hover:text-amber-500 hover:bg-zinc-900 rounded-lg transition-colors"
                aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* قائمة الجوال المنبثقة */}
            {mobileMenuOpen && (
              <div className="md:hidden absolute top-full left-0 right-0 bg-zinc-950/95 backdrop-blur-md border-b border-amber-900/20 h-screen overflow-y-auto pb-20">
                <div className="flex flex-col py-6 px-6 gap-5">
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                  >
                    <Store className="w-6 h-6 text-amber-500" />
                    <span className="font-medium">المتجر</span>
                  </Link>
                  <Link
                    href="/studio"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                  >
                    <Camera className="w-6 h-6 text-amber-500" />
                    <span className="font-medium">استديو الهيثم</span>
                  </Link>
                  <Link
                    href="/articles"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                  >
                    المدونة
                  </Link>
                  <Link
                    href="/custom-mixtures"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                  >
                    الخلطات الخاصة
                  </Link>
                  <Link
                    href="/draw"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 text-amber-300 hover:text-amber-200 transition-colors py-3 text-lg border-b border-zinc-800/50"
                  >
                    <Gift className="w-6 h-6 text-amber-500" />
                    <span className="font-medium">السحب الأسبوعي</span>
                  </Link>
                  <Link
                    href={customer ? '/account' : '/account/login'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                  >
                    <UserRound className="w-6 h-6 text-amber-500" />
                    <span className="font-medium">
                      {customer ? `حسابي — ${customer.name}` : 'تسجيل الدخول'}
                    </span>
                  </Link>
                  <Link
                    href="/about-us"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                  >
                    حكايتنا
                  </Link>
                  <Link
                    href="/quality-standards"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                  >
                    الجودة
                  </Link>
                  <Link
                    href="/faq"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                  >
                    الأسئلة الشائعة
                  </Link>

                  {/* أزرار الإجراءات في الجوال */}
                  <div className="flex gap-3 pt-2 border-t border-zinc-800/50">
                    <Link
                      href="/wishlist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-900 rounded-xl text-zinc-300 font-bold"
                    >
                      <Heart className="w-5 h-5" />
                      المفضلة ({savedCount})
                    </Link>
                    <Link
                      href="/cart"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-900 rounded-xl text-zinc-300 font-bold"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      السلة ({cartCount})
                    </Link>
                  </div>

                  <a
                    href={getWhatsAppLink(SITE.whatsappDefaultMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-2 w-full py-4 gold-gradient rounded-xl text-zinc-950 text-lg font-black text-center luxury-shadow active:scale-95 transition-transform"
                  >
                    🍯 اطلب الآن عبر واتساب
                  </a>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
