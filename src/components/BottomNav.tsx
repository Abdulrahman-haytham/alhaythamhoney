'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Store, ShoppingCart, Heart, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SITE, getWhatsAppLink } from '@/lib/config';
import { useCart } from '@/store/cartStore';
import { useWishlist } from '@/store/wishlistStore';
import { trackWhatsAppClick } from '@/lib/analytics';

/**
 * شريط تنقّل سفلي — جوال فقط.
 * يضع الإجراءات في منطقة الإبهام بدل أعلى الشاشة، ويستوعب زر واتساب
 * الذي كان عائماً فوق المحتوى. ارتفاعه محجوز في <main> عبر pb-16.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { getTotalItems } = useCart();
  const wishlistCount = useWishlist((s) => s.items.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  // العدّادات من localStorage — تُصفَّر قبل الترطيب لتفادي عدم التطابق
  const cartCount = mounted ? getTotalItems() : 0;
  const savedCount = mounted ? wishlistCount : 0;

  // لا يظهر داخل لوحة التحكم
  if (pathname.startsWith('/admin')) return null;

  const items = [
    { href: '/', label: 'الرئيسية', icon: Home, badge: 0 },
    { href: '/shop', label: 'المتجر', icon: Store, badge: 0 },
    { href: '/cart', label: 'السلة', icon: ShoppingCart, badge: cartCount },
    { href: '/wishlist', label: 'المفضلة', icon: Heart, badge: savedCount },
  ];

  return (
    <nav
      aria-label="تنقّل سريع"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="flex items-stretch">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex h-14 flex-col items-center justify-center gap-0.5 transition-colors ${
                  active ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.7} />
                  <AnimatePresence>
                    {badge > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold tabular-nums text-zinc-950"
                      >
                        {badge > 99 ? '99+' : badge}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <span className="text-[10px] font-medium leading-none">{label}</span>
                {active && (
                  <motion.span
                    layoutId="bottomNavActive"
                    className="absolute inset-x-3 top-0 h-0.5 rounded-b-full bg-amber-400"
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </Link>
            </li>
          );
        })}

        <li className="flex-1">
          <a
            href={getWhatsAppLink(SITE.whatsappDefaultMessage)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick('bottom-nav')}
            className="flex h-14 flex-col items-center justify-center gap-0.5 text-[#25D366] transition-colors hover:text-[#3ce07c]"
          >
            <MessageCircle className="h-5 w-5" strokeWidth={1.9} />
            <span className="text-[10px] font-medium leading-none">واتساب</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
