'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/config';
import { EASE, useMotionPrefs } from '@/lib/motion';
import { Reveal } from '@/components/motion/Reveal';
import { trackWhatsAppClick } from '@/lib/analytics';

/** المشهد الختامي قبل التذييل: مرطبان كبير على خلفية داكنة، عبارة واحدة، وزرّان. */
export default function FinalCta() {
  const prefs = useMotionPrefs();
  return (
    <section className="relative overflow-hidden bg-black py-20 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 60% at 50% 60%, rgba(212,175,55,0.18), rgba(212,175,55,0.04) 50%, transparent 75%)',
        }}
      />
      <div className="container relative mx-auto flex flex-col items-center px-4 text-center sm:px-6">
        <motion.img
          src="/images/jar.webp"
          alt="مرطبان عسل الهيثم"
          width={356}
          height={458}
          loading="lazy"
          initial={prefs.reduced ? false : { opacity: 0, y: 28, scale: 0.94 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, ease: EASE }}
          className="h-64 w-auto drop-shadow-[0_40px_60px_rgba(0,0,0,0.7)] sm:h-80 lg:h-96"
        />
        <Reveal delay={0.2} className="mt-8">
          {/* الشعار يُضاف هنا حين تتوفر نسخته الشفافة/SVG — الصورة الحالية مربّع بخلفية */}
          <h2 className="font-amiri text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            من مناحلنا… إلى مائدتك.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-zinc-400 sm:text-base">
            عسل بنفس الجودة التي خرج بها من الخلية — مفحوص، موثوق، ويصلك أينما كنت في سوريا.
          </p>
        </Reveal>
        <Reveal delay={0.3} className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="group inline-flex h-12 items-center gap-2 rounded-full gold-gradient px-7 text-sm font-black text-zinc-950 luxury-shadow hover:-translate-y-0.5 sm:text-base"
          >
            اكتشف أنواع العسل
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          </Link>
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick('final-cta')}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-amber-500/40 px-6 text-sm font-bold text-amber-200 transition-colors hover:border-amber-400 hover:bg-amber-500/10 sm:text-base"
          >
            <MessageCircle className="h-4 w-4 text-green-400" /> تواصل معنا
          </a>
        </Reveal>
      </div>
    </section>
  );
}
