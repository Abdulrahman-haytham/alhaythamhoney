import Image from 'next/image';
import { ShieldCheck, Microscope, Award, Truck } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/config';
import { getSettings } from '@/lib/settings.server';

const trustIcons = [
  { icon: <ShieldCheck className="w-5 h-5" />, text: 'طبيعي 100%' },
  { icon: <Microscope className="w-5 h-5" />, text: 'مفحوص مخبرياً' },
  { icon: <Award className="w-5 h-5" />, text: 'خبرة عائلية 25+ عاماً' },
  { icon: <Truck className="w-5 h-5" />, text: 'شحن آمن داخل سوريا' },
];

const DEFAULT_HERO_IMAGE = '/images/hero.webp';

/**
 * النصوص وصورة الخلفية تُحرَّر من /admin/settings.
 * مكوّن خادم بحركات CSS: العنوان يصل المتصفح مرئياً فيُرسَم فوراً بدل أن ينتظر
 * framer-motion — هذا وحده خفّض LCP على الجوال من نحو ٦ ثوانٍ إلى أقل من ثانيتين.
 */
export default async function Hero() {
  const s = await getSettings();
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden pt-16 md:pt-20 pb-8 md:pb-0">
      {/* خلفية متحركة بهدوء */}
      <div className="zoom-slow absolute inset-0 z-0">
        <Image
          src={s.heroImage ?? DEFAULT_HERO_IMAGE}
          alt="عسل طبيعي 100% من مراعي سوريا - الهيثم — نحل وعسل"
          fill
          priority
          sizes="100vw"
          className="object-cover grayscale-[10%] brightness-[0.3]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <div
          style={{ animationDelay: '0.15s' }}
          className="rise inline-block px-6 py-2 border-2 border-amber-500/40 rounded-full mb-8 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 backdrop-blur-md shadow-lg shadow-amber-500/20"
        >
          <span className="text-amber-400 text-xs md:text-sm font-black tracking-widest uppercase flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            {s.heroBadge}
          </span>
        </div>

        <h1
          style={{ animationDelay: '0.05s' }}
          className="rise-scale text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-amiri font-bold text-white mb-4 md:mb-6 leading-tight px-2"
        >
          {s.heroTitle} <br />
          <span className="gold-text">{s.heroHighlight}</span>
        </h1>

        <p
          style={{ animationDelay: '0.25s' }}
          className="rise max-w-2xl mx-auto text-zinc-300 text-sm sm:text-base md:text-lg lg:text-2xl mb-8 md:mb-12 font-light leading-relaxed px-4"
        >
          {s.heroSubtitle}
        </p>

        {/* شبكة أيقونات الثقة */}
        <div
          style={{ animationDelay: '0.35s' }}
          className="rise flex flex-wrap justify-center gap-6 md:gap-10 mb-14"
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
        </div>

        {/* زر الدعوة لاتخاذ إجراء */}
        <div style={{ animationDelay: '0.45s' }} className="rise flex justify-center">
          <a
            href={getWhatsAppLink()}
            className="group relative px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 gold-gradient rounded-full text-zinc-950 font-black text-sm sm:text-base md:text-xl luxury-shadow transition-all hover:scale-105 active:scale-95"
          >
            🍯 اطلب عبر واتساب
          </a>
        </div>
      </div>

      <div className="bob absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20 hidden md:block">
        <div className="w-6 h-10 border-2 border-amber-500 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-amber-500 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
