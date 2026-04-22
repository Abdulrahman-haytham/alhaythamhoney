import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Award, Truck, Store, Menu, X, Search, ShoppingCart, Heart } from 'lucide-react';
import { SITE, getWhatsAppLink } from '../config/site';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { SearchBar } from './SearchBar';
import { Image } from './Image';

const SkipLink: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-[200] focus:bg-amber-500 focus:text-zinc-950 focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:shadow-lg"
    aria-label="انتقل إلى المحتوى الرئيسي"
  >
    انتقل إلى المحتوى الرئيسي
  </a>
);

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleCart, totalItems: cartCount } = useCart();
  const { toggleOpen: toggleWishlistSidebar, totalItems: wishlistCount } = useWishlist();

  // Prevent scrolling when mobile menu is open
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
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <>
      <SkipLink />
      <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <header className="fixed top-0 left-0 w-full z-50">
        {/* Top Excellence Bar */}
        <div className="bg-black border-b border-amber-900/30 py-1.5 sm:py-2 px-3 sm:px-4 text-[10px] sm:text-xs md:text-sm font-light tracking-wide overflow-hidden">
          {/* Mobile Marquee View */}
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

          {/* Desktop Static View */}
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

        {/* Main Navigation */}
        <nav className="bg-zinc-950/80 backdrop-blur-md border-b border-amber-900/20 py-1.5 sm:py-2 px-3 sm:px-4 md:px-6" aria-label="التنقل الرئيسي">
          <div className="container mx-auto flex justify-between items-center">
            {/* Logo */}
            <a
              href="/"
              onClick={handleLogoClick}
              className="flex items-center gap-2 sm:gap-3 md:gap-4 hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="الهيثم لنحل وعسل - الصفحة الرئيسية"
            >
              <Image
                src="https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1767958674/my-app-uploads/kromozksoa3vpcwrnvtw.jpg"
                alt="لوغو الهيثم"
                width="64"
                height="64"
                fetchPriority="high"
                loading="eager"
                className="h-10 sm:h-12 md:h-16 w-auto object-contain brightness-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]"
              />
              <div className="flex flex-col border-r border-zinc-800 pr-2 sm:pr-3 md:pr-4 mr-1 sm:mr-2">
                <span className="text-lg sm:text-xl md:text-2xl font-amiri font-bold gold-text leading-tight">الهيثم</span>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-zinc-500 tracking-[0.15em] sm:tracking-[0.2em] uppercase font-bold">لنحل وعسل</span>
              </div>
            </a>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex gap-6 xl:gap-8 text-sm font-medium text-zinc-400">
              <Link to="/shop" className="flex items-center gap-2 hover:text-amber-500 transition-colors">
                <Store className="w-4 h-4" />
                المتجر
              </Link>
              <Link to="/articles" className="hover:text-amber-500 transition-colors">المدونة</Link>
              <Link to="/custom-mixtures" className="hover:text-amber-500 transition-colors">الخلطات الخاصة</Link>
              <Link to="/about-us" className="hover:text-amber-500 transition-colors">قصتنا</Link>
              <Link to="/quality-standards" className="hover:text-amber-500 transition-colors">الجودة</Link>
              <Link to="/faq" className="hover:text-amber-500 transition-colors">الأسئلة الشائعة</Link>
            </div>

            {/* Action Icons + CTA */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 text-zinc-400 hover:text-amber-500 hover:bg-zinc-900 rounded-lg transition-colors"
                aria-label="البحث"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <button
                onClick={toggleWishlistSidebar}
                className="relative p-2.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors"
                aria-label={`المفضلة (${wishlistCount} عنصر)`}
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative p-2.5 text-zinc-400 hover:text-amber-500 hover:bg-zinc-900 rounded-lg transition-colors"
                aria-label={`سلة الطلبات (${cartCount} عنصر)`}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-zinc-950 text-[10px] font-black rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* WhatsApp CTA (Desktop) */}
              <a
                href={getWhatsAppLink(SITE.whatsappDefaultMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:block px-4 lg:px-6 py-1.5 lg:py-2 gold-gradient rounded-full text-zinc-950 text-xs lg:text-sm font-black luxury-shadow hover:scale-105 transition-transform"
              >
                اطلب الآن
              </a>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 text-zinc-400 hover:text-amber-500 hover:bg-zinc-900 rounded-lg transition-colors"
                aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
              <div className="md:hidden absolute top-full left-0 right-0 bg-zinc-950/95 backdrop-blur-md border-b border-amber-900/20 h-screen overflow-y-auto pb-20">
                <div className="flex flex-col py-6 px-6 gap-5">
                  {/* Mobile Search */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSearchOpen(true);
                    }}
                    className="flex items-center gap-4 text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                  >
                    <Search className="w-6 h-6 text-amber-500" />
                    <span className="font-medium">البحث</span>
                  </button>

                  <Link
                    to="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                  >
                    <Store className="w-6 h-6 text-amber-500" />
                    <span className="font-medium">المتجر</span>
                  </Link>
                  <Link
                    to="/articles"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                  >
                    المدونة
                  </Link>
                  <Link
                    to="/custom-mixtures"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                  >
                    الخلطات الخاصة
                  </Link>
                  <Link
                    to="/about-us"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                  >
                    حكايتنا
                  </Link>
                  <Link
                    to="/quality-standards"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                  >
                    الجودة
                  </Link>
                  <Link
                    to="/faq"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                  >
                    الأسئلة الشائعة
                  </Link>

                  {/* Mobile Action Buttons */}
                  <div className="flex gap-3 pt-2 border-t border-zinc-800/50">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        toggleWishlistSidebar();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-900 rounded-xl text-zinc-300 font-bold"
                    >
                      <Heart className="w-5 h-5" />
                      المفضلة ({wishlistCount})
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        toggleCart();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-900 rounded-xl text-zinc-300 font-bold"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      السلة ({cartCount})
                    </button>
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
    </>
  );
};
