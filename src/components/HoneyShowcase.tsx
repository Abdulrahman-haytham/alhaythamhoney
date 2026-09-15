'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, Sparkles } from 'lucide-react';
import type { CatalogProduct } from '@/lib/products.server';
import { priceFrom } from '@/lib/variants';
import { catalogAvailable } from '@/lib/bundles';
import { getWhatsAppLink } from '@/lib/config';
import { fmtSyp } from '@/lib/pricing';
import { EASE, useMotionPrefs } from '@/lib/motion';
import { Reveal } from '@/components/motion/Reveal';
import { trackWhatsAppClick } from '@/lib/analytics';

const SHARED_JAR = '/images/jar.webp';
const GOLD = '#d4af37';

const hexToRgba = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

/**
 * عرض أنواع العسل (Odoo-style storytelling): على الحاسوب المرطبان ثابت (sticky) وتتبدّل
 * الأنواع أثناء التمرير بتلاشٍ وتكبير خفيف مع صبغة خلفية لكل نوع؛ على الجوال سلايدر أفقي.
 * النصوص كلها في التدفق الطبيعي للصفحة (لا اختطاف للتمرير، وتُقرأ بلا JavaScript).
 */
export default function HoneyShowcase({ products }: { products: CatalogProduct[] }) {
  const items = products.slice(0, 5);
  const [active, setActive] = useState(0);
  const prefs = useMotionPrefs();
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  // الخطوة التي تشغل منتصف الشاشة هي الفعّالة — IntersectionObserver لا حسابات تمرير
  useEffect(() => {
    const steps = stepRefs.current.filter((el): el is HTMLLIElement => !!el);
    if (steps.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    steps.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items.length]);

  if (items.length === 0) return null;
  const current = items[Math.min(active, items.length - 1)];
  const accent = current.accentColor ?? GOLD;

  return (
    <section id="honey" className="relative bg-zinc-950">
      {/* الترويسة */}
      <div className="container mx-auto px-4 pt-16 sm:px-6 sm:pt-24">
        <Reveal className="max-w-2xl">
          <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500 sm:text-xs">
            كنوز النحل
          </span>
          <h2 className="font-amiri text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
            عسل صافٍ من مراعٍ مختارة
          </h2>
          <p className="mt-3 text-sm text-zinc-400 sm:text-base">
            لكل زهرة عسلها — تعرّف على أنواعنا واحداً واحداً.
          </p>
        </Reveal>
      </div>

      {/* الحاسوب: مرطبان ثابت + خطوات تمرّ */}
      <div className="container mx-auto hidden px-6 lg:grid lg:grid-cols-2 lg:gap-16">
        {/* المرطبان في العمود الثاني (يسار الشاشة) كما في الـ Hero — النص يبدأ من اليمين */}
        <div className="relative order-last">
          <div className="sticky top-28 flex h-[calc(100vh-8rem)] items-center justify-center">
            <motion.div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              animate={{
                background: `radial-gradient(closest-side, ${hexToRgba(accent, 0.22)}, ${hexToRgba(accent, 0.06)} 55%, transparent 72%)`,
              }}
              transition={{ duration: 0.8, ease: EASE }}
            />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={current.id}
                src={current.cutoutImage ?? SHARED_JAR}
                alt={current.name}
                width={356}
                height={458}
                loading="lazy"
                initial={prefs.reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={prefs.reduced ? { opacity: 0 } : { opacity: 0, scale: 1.03, y: -10 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="relative h-[460px] w-auto drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)] xl:h-[520px]"
              />
            </AnimatePresence>
            {/* مؤشر الأنواع */}
            <ol className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2" aria-hidden>
              {items.map((p, i) => (
                <li
                  key={p.id}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? 'w-8 bg-amber-400' : 'w-2 bg-zinc-700'}`}
                />
              ))}
            </ol>
          </div>
        </div>

        <ol>
          {items.map((p, i) => {
            const price = priceFrom(p);
            const available = catalogAvailable(p);
            const on = i === active;
            return (
              <li
                key={p.id}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                data-index={i}
                className="flex min-h-[70vh] items-center py-10"
              >
                <div
                  className={`transition-[opacity,transform] duration-500 ease-out ${on ? 'opacity-100 translate-x-0' : 'opacity-35 -translate-x-2'}`}
                >
                  <span className="mb-3 inline-flex items-center gap-2 text-xs font-bold text-amber-500">
                    <Sparkles className="h-4 w-4" /> {String(i + 1).padStart(2, '0')} /{' '}
                    {String(items.length).padStart(2, '0')}
                  </span>
                  <h3 className="font-amiri text-4xl font-bold text-white xl:text-5xl">{p.name}</h3>
                  {p.benefit && (
                    <p className="mt-2 text-sm font-bold text-amber-300">{p.benefit}</p>
                  )}
                  <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-300">{p.desc}</p>
                  <div className="mt-6 flex items-center gap-4">
                    {price.price != null && (
                      <p className="text-2xl font-bold gold-text tabular-nums">
                        {price.from && <span className="ml-1 text-xs text-zinc-500">يبدأ من</span>}
                        {fmtSyp(price.price)} <span className="text-xs text-zinc-500">ل.س</span>
                      </p>
                    )}
                    {!available && <span className="text-xs text-red-300">نفد مؤقتاً</span>}
                  </div>
                  <Link
                    href={`/product/${p.slug}`}
                    className="group mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-amber-500/40 px-6 text-sm font-bold text-amber-200 transition-colors duration-200 hover:border-amber-400 hover:bg-amber-500/10"
                  >
                    اكتشف هذا العسل
                    <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* الجوال: سلايدر أفقي خفيف */}
      <div className="-mx-0 mt-8 grid snap-x snap-mandatory auto-cols-[78%] grid-flow-col gap-4 overflow-x-auto px-4 pb-6 [scrollbar-width:none] sm:auto-cols-[46%] lg:hidden [&::-webkit-scrollbar]:hidden">
        {items.map((p) => {
          const price = priceFrom(p);
          return (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group relative snap-start overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 text-center"
            >
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(60% 45% at 50% 35%, ${hexToRgba(p.accentColor ?? GOLD, 0.16)}, transparent 70%)`,
                }}
              />
              <img
                src={p.cutoutImage ?? SHARED_JAR}
                alt={p.name}
                loading="lazy"
                width={356}
                height={458}
                className="relative mx-auto h-44 w-auto drop-shadow-[0_18px_30px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <h3 className="relative mt-4 font-amiri text-xl font-bold text-white">{p.name}</h3>
              {p.benefit && <p className="relative mt-1 text-xs text-amber-300">{p.benefit}</p>}
              {price.price != null && (
                <p className="relative mt-2 text-lg font-bold gold-text tabular-nums">
                  {fmtSyp(price.price)} <span className="text-[10px] text-zinc-500">ل.س</span>
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {/* وجدت عسلك؟ */}
      <div className="container mx-auto px-4 pb-16 sm:px-6 sm:pb-24">
        <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-6 text-center sm:flex-row sm:justify-between sm:text-right">
          <div>
            <h3 className="font-amiri text-2xl font-bold text-white">وجدت عسلك؟</h3>
            <p className="mt-1 text-sm text-zinc-400">
              نؤكد السعر والتوفر معك على واتساب خلال دقائق.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <a
              href={getWhatsAppLink('مرحباً عسل الهيثم، أود الاستفسار عن أنواع العسل.')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('showcase')}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-green-600 px-5 text-sm font-bold text-white transition-colors hover:bg-green-500"
            >
              <MessageCircle className="h-4 w-4" /> اطلب عبر واتساب
            </a>
            <Link
              href="/shop"
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-zinc-700 px-5 text-sm text-zinc-200 transition-colors hover:border-amber-500/50"
            >
              كل الأنواع <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
