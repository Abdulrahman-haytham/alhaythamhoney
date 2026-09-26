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
  BookOpen,
  Newspaper,
  FlaskConical,
  Users,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';
import { SITE, getWhatsAppLink } from '@/lib/config';
import { trackWhatsAppClick } from '@/lib/analytics';
import { useCart } from '@/store/cartStore';
import { useWishlist } from '@/store/wishlistStore';
import { useSettings } from '@/components/SettingsProvider';
import { useSiteContent } from '@/components/SiteContentProvider';
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
  const { hasStudioPhotos } = useSiteContent();
  const customer = useCustomer();
  const mounted = useHydrated();
  const pathname = usePathname();
  const router = useRouter();
  const { getTotalItems } = useCart();
  const wishlistCount = useWishlist((s) => s.items.length);

  // العدّادات من localStorage — تُصفَّر قبل الترطيب لتفادي عدم التطابق
  const cartCount = mounted ? getTotalItems() : 0;
  const savedCount = mounted ? wishlistCount : 0;

  // روابط قائمة الجوال — أيقونة لكل رابط حتى تصطفّ النصوص على عمود واحد
  const mobileLinks = [
    { href: '/shop', label: 'المتجر', icon: Store, accent: false },
    // الاستديو لا يُعرض وهو فارغ: رابط إلى معرض بلا صور يهدم الثقة التي جاء يبنيها
    ...(hasStudioPhotos
      ? [{ href: '/studio', label: 'استديو الهيثم', icon: Camera, accent: false }]
      : []),
    { href: '/articles', label: 'المدونة', icon: Newspaper, accent: false },
    { href: '/beekeeping', label: 'موسوعة النحّال', icon: BookOpen, accent: false },
    { href: '/custom-mixtures', label: 'الخلطات الخاصة', icon: FlaskConical, accent: false },
    { href: '/draw', label: 'السحب الأسبوعي', icon: Gift, accent: true },
    {
      href: customer ? '/account' : '/account/login',
      label: customer ? `حسابي — ${customer.name}` : 'تسجيل الدخول',
      icon: UserRound,
      accent: false,
    },
    { href: '/about-us', label: 'حكايتنا', icon: Users, accent: false },
    { href: '/quality-standards', label: 'الجودة', icon: ShieldCheck, accent: false },
    { href: '/faq', label: 'الأسئلة الشائعة', icon: HelpCircle, accent: false },
  ];

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
            <div className="hidden md:flex gap-5 xl:gap-8 text-sm font-medium text-zinc-400 whitespace-nowrap">
              <Link
                href="/shop"
                className="flex items-center gap-2 hover:text-amber-500 transition-colors"
              >
                <Store className="w-4 h-4" />
                المتجر
              </Link>
              {hasStudioPhotos && (
                <Link
                  href="/studio"
                  className="hidden lg:block hover:text-amber-500 transition-colors"
                >
                  الاستديو
                </Link>
              )}
              <Link href="/articles" className="hover:text-amber-500 transition-colors">
                المدونة
              </Link>
              <Link
                href="/beekeeping"
                className="hidden lg:block hover:text-amber-500 transition-colors"
              >
                الموسوعة
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
              <Link
                href="/quality-standards"
                className="hidden lg:block hover:text-amber-500 transition-colors"
              >
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
                className="p-3 text-zinc-400 hover:text-amber-500 hover:bg-zinc-900 rounded-lg transition-colors"
                aria-label="البحث في الموقع"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* الحساب */}
              <Link
                href={customer ? '/account' : '/account/login'}
                className={`relative p-3 rounded-lg transition-colors hover:bg-zinc-900 ${customer ? 'text-amber-400' : 'text-zinc-400 hover:text-amber-500'}`}
                aria-label={customer ? `حسابي (${customer.name})` : 'تسجيل الدخول'}
              >
                <UserRound className="w-5 h-5" />
                {customer && (
                  <span className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-green-400 ring-2 ring-zinc-950" />
                )}
              </Link>

              {/* المفضلة — تظهر حين يكون فيها شيء */}
              {savedCount > 0 && (
                <Link
                  href="/wishlist"
                  className="relative hidden p-3 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-red-400 sm:block"
                  aria-label={`المفضلة (${savedCount} عنصر)`}
                >
                  <Heart className="w-5 h-5" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {savedCount > 9 ? '9+' : savedCount}
                  </span>
                </Link>
              )}

              {/* السلة */}
              <Link
                href="/cart"
                className="relative hidden p-3 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-amber-500 sm:block"
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
                className="md:hidden p-3 text-zinc-400 hover:text-amber-500 hover:bg-zinc-900 rounded-lg transition-colors"
                aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* قائمة الجوال المنبثقة.
                ارتفاعها محدود بالشاشة ناقص الرأس والشريط السفلي: كانت h-screen
                تبدأ تحت الرأس فتمتدّ خلف حافة الشاشة وتدفن آخر عناصرها. */}
            {mobileMenuOpen && (
              <div
                id="mobile-menu"
                className="md:hidden absolute top-full left-0 right-0 max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain border-b border-amber-900/20 bg-zinc-950"
              >
                <div className="flex flex-col gap-1 px-5 py-5 pb-24">
                  {/* الدعوة أولاً لا أخيراً: هذا هو الإجراء المقصود من الموقع كله،
                      وبالأخضر المعروف لا بالذهبي الذي يشبه كل شيء آخر. */}
                  <a
                    href={getWhatsAppLink(SITE.whatsappDefaultMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackWhatsAppClick('mobile-menu');
                      setMobileMenuOpen(false);
                    }}
                    className="mb-4 flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] py-4 text-lg font-black text-zinc-950 transition-transform active:scale-95"
                  >
                    <MessageCircle className="h-5 w-5" />
                    اطلب الآن عبر واتساب
                  </a>

                  {mobileLinks.map(({ href, label, icon: Icon, accent }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex min-h-[52px] items-center gap-4 border-b border-zinc-800/50 py-3 text-lg transition-colors ${
                        accent
                          ? 'text-amber-300 hover:text-amber-200'
                          : 'text-zinc-300 hover:text-amber-500'
                      }`}
                    >
                      <Icon className="h-6 w-6 shrink-0 text-amber-500" />
                      <span className="font-medium">{label}</span>
                    </Link>
                  ))}
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
