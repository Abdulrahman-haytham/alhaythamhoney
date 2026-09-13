'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Microscope, Award, Truck } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/config';
import { useSettings } from '@/components/SettingsProvider';

const trustIcons = [
  { icon: <ShieldCheck className="w-5 h-5" />, text: 'طبيعي 100%' },
  { icon: <Microscope className="w-5 h-5" />, text: 'مفحوص مخبرياً' },
  { icon: <Award className="w-5 h-5" />, text: 'خبرة عائلية 25+ عاماً' },
  { icon: <Truck className="w-5 h-5" />, text: 'شحن آمن داخل سوريا' },
];

const DEFAULT_HERO_IMAGE =
  'https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1767958674/my-app-uploads/kromozksoa3vpcwrnvtw.jpg';

/** النصوص وصورة الخلفية تُحرَّر من /admin/settings. */
export default function Hero() {
  const s = useSettings();
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden pt-16 md:pt-20 pb-8 md:pb-0">
      {/* خلفية متحركة بهدوء */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="absolute inset-0 z-0"
      >
        <img
          src={s.heroImage ?? DEFAULT_HERO_IMAGE}
          alt="عسل طبيعي 100% من مراعي سوريا - الهيثم — نحل وعسل"
          fetchPriority="high"
          loading="eager"
          width={1920}
          height={1080}
          className="w-full h-full object-cover grayscale-[10%] brightness-[0.3]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-block px-6 py-2 border-2 border-amber-500/40 rounded-full mb-8 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 backdrop-blur-md shadow-lg shadow-amber-500/20"
        >
          <span className="text-amber-400 text-xs md:text-sm font-black tracking-widest uppercase flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            {s.heroBadge}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-amiri font-bold text-white mb-4 md:mb-6 leading-tight px-2"
        >
          {s.heroTitle} <br />
          <span className="gold-text">{s.heroHighlight}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="max-w-2xl mx-auto text-zinc-300 text-sm sm:text-base md:text-lg lg:text-2xl mb-8 md:mb-12 font-light leading-relaxed px-4"
        >
          {s.heroSubtitle}
        </motion.p>

        {/* شبكة أيقونات الثقة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="flex flex-wrap justify-center gap-6 md:gap-10 mb-14"
        >
          {trustIcons.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-amber-200/70 text-xs sm:text-sm md:text-base font-medium"
            >
              <span className="text-amber-500">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* زر الدعوة لاتخاذ إجراء */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="flex justify-center"
        >
          <a
            href={getWhatsAppLink()}
            className="group relative px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 gold-gradient rounded-full text-zinc-950 font-black text-sm sm:text-base md:text-xl luxury-shadow transition-all hover:scale-105 active:scale-95"
          >
            🍯 اطلب عبر واتساب
          </a>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20 hidden md:block"
      >
        <div className="w-6 h-10 border-2 border-amber-500 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-amber-500 rounded-full"></div>
        </div>
      </motion.div>
    </section>
  );
}
