'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Microscope, Award, Truck, MessageCircle, ArrowLeft } from 'lucide-react';
import { getWhatsAppLink, yearsOfExperience } from '@/lib/config';
import { useSettings } from '@/components/SettingsProvider';
import { DUR, EASE, useMotionPrefs } from '@/lib/motion';
import { TextReveal } from '@/components/motion/TextReveal';
import { ParallaxLayer } from '@/components/motion/ParallaxLayer';
import { trackWhatsAppClick } from '@/lib/analytics';

const DEFAULT_HERO_IMAGE = '/images/hero.webp';
/** المرطبان المقصوص (خلفية شفافة) — بطل المشهد */
const HERO_JAR = '/images/jar.webp';

/** إيقاع الدخول: كل شيء يكتمل خلال ~0.9 ثانية، والأزرار ظاهرة قبل ذلك */
const enter = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DUR.base, ease: EASE, delay },
});

/** النصوص وصورة الخلفية تُحرَّر من /admin/settings. */
export default function Hero() {
  const s = useSettings();
  const prefs = useMotionPrefs();
  const years = yearsOfExperience();
  const trust = [
    { icon: ShieldCheck, text: 'طبيعي 100%' },
    { icon: Microscope, text: 'مفحوص مخبرياً' },
    { icon: Award, text: `خبرة عائلية +${years} عاماً` },
    { icon: Truck, text: 'شحن آمن داخل سوريا' },
  ];

  return (
    <section className="relative flex min-h-[92svh] w-full items-center overflow-hidden pt-24 pb-10 md:pt-28 md:pb-16">
      {/* الخلفية: صورة المنحل معتمة مع انزياح صغير جداً مع التمرير (حاسوب فقط) */}
      <ParallaxLayer distance={70} className="absolute inset-[-40px] z-0">
        <img
          src={s.heroImage ?? DEFAULT_HERO_IMAGE}
          alt=""
          fetchPriority="high"
          loading="eager"
          width={1280}
          height={1280}
          className="h-full w-full object-cover brightness-[0.28] grayscale-[10%]"
        />
      </ParallaxLayer>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-zinc-950/30" />

      <div className="container relative z-10 mx-auto grid items-center gap-8 px-5 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
        {/* المرطبان — على الجوال فوق النص، وعلى الحاسوب في العمود الثاني (يسار الشاشة) */}
        <div className="relative order-first flex justify-center lg:order-last">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                'radial-gradient(closest-side, rgba(212,175,55,0.28), rgba(212,175,55,0.08) 55%, transparent 72%)',
            }}
          />
          <motion.div
            initial={prefs.reduced ? false : { opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
            className="relative"
          >
            <motion.img
              src={HERO_JAR}
              alt="مرطبان عسل الهيثم"
              width={356}
              height={458}
              fetchPriority="high"
              loading="eager"
              animate={prefs.reduced || prefs.lowPower ? undefined : { y: [0, -7, 0] }}
              transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity, delay: 1.2 }}
              className="h-[220px] w-auto drop-shadow-[0_30px_50px_rgba(0,0,0,0.65)] sm:h-[280px] lg:h-[440px] xl:h-[500px]"
            />
          </motion.div>
        </div>

        <div className="text-center lg:text-right">
          <motion.div {...enter(0)} className="mb-5 inline-flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/35 bg-amber-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-amber-300 sm:text-xs">
              <Award className="h-4 w-4 text-amber-500" />
              {s.heroBadge}
            </span>
          </motion.div>

          <h1 className="mb-4 font-amiri text-[2.1rem] font-bold leading-[1.18] text-white sm:text-5xl md:mb-6 lg:text-[3.4rem] xl:text-[4.2rem]">
            <TextReveal text={s.heroTitle} mode="mount" delay={0.05} stagger={0.045} />
            <br />
            <TextReveal
              text={s.heroHighlight}
              mode="mount"
              delay={0.28}
              stagger={0.045}
              className="gold-text"
            />
          </h1>

          <motion.p
            {...enter(0.45)}
            className="mx-auto mb-7 max-w-xl text-sm font-light leading-relaxed text-zinc-300 sm:text-base lg:mx-0 lg:text-lg"
          >
            {s.heroSubtitle}
          </motion.p>

          <motion.div
            {...enter(0.55)}
            className="mb-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Link
              href="/shop"
              className="group inline-flex h-12 items-center gap-2 rounded-full gold-gradient px-7 text-sm font-black text-zinc-950 luxury-shadow transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 sm:h-13 sm:text-base"
            >
              اكتشف أنواع العسل
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            </Link>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('hero')}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-amber-500/40 px-6 text-sm font-bold text-amber-200 transition-colors duration-200 hover:border-amber-400 hover:bg-amber-500/10 sm:h-13 sm:text-base"
            >
              <MessageCircle className="h-4 w-4 text-green-400" />
              اطلب عبر واتساب
            </a>
          </motion.div>

          <motion.ul
            {...enter(0.7)}
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-amber-100/70 sm:text-sm lg:justify-start"
          >
            {trust.map((item) => (
              <li key={item.text} className="flex items-center gap-1.5">
                <item.icon className="h-4 w-4 text-amber-500" />
                <span>{item.text}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>

      {/* تلميح التمرير — حاسوب فقط */}
      <motion.div
        aria-hidden
        animate={prefs.reduced ? undefined : { y: [0, 6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 opacity-25 md:block"
      >
        <div className="flex h-9 w-5 justify-center rounded-full border border-amber-500 p-1">
          <div className="h-2 w-1 rounded-full bg-amber-500" />
        </div>
      </motion.div>
    </section>
  );
}
