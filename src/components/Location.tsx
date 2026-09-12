'use client';

import { MapPin, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { SITE, getTelLink } from '@/lib/config';

const address = 'الحي الشمالي، جانب مسجد بلال الحبشي، قمحانة، حماة، سوريا';
const mapsSearchUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`;

/** قسم الموقع — عنوان المنحل وأوقات الاستقبال، ببطاقة ثابتة بدل تضمين خريطة فعلية. */
export function Location() {
  return (
    <section id="location" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>

      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4 sm:mb-6">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
            <span className="text-amber-500 text-[10px] sm:text-xs font-black tracking-wider sm:tracking-widest uppercase">
              تفضل بزيارتنا
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-amiri font-bold mb-4 sm:mb-6 px-2">
            موقعنا في قلب سوريا
          </h2>
          <p className="text-zinc-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            يسعدنا استقبالكم في مركزنا الرئيسي لتذوق أجود أنواع العسل مباشرة من المنحل.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12 items-start">
          {/* تفاصيل العنوان */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1 space-y-6 sm:space-y-8"
          >
            <div className="bg-zinc-900/50 p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] border border-white/5 luxury-shadow">
              <h3 className="text-xl sm:text-2xl font-amiri font-bold text-white mb-3 sm:mb-4">العنوان الدقيق</h3>
              <p className="text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 italic">
                {address}
              </p>
              <a
                href={mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 sm:gap-3 w-full py-3 sm:py-4 bg-amber-500 text-zinc-950 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base hover:scale-105 transition-transform"
              >
                <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
                فتح في خرائط جوجل
              </a>
            </div>

            <div className="bg-zinc-900/30 p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] border border-amber-500/5">
              <h4 className="text-amber-500 font-bold mb-2 text-sm sm:text-base">أوقات الاستقبال</h4>
              <p className="text-zinc-400 text-xs sm:text-sm md:text-base mb-4">{SITE.workingHours}</p>
              <a
                href={getTelLink()}
                className="text-amber-500 hover:text-amber-400 font-bold text-lg transition-colors"
              >
                📞 <span dir="ltr">{SITE.phoneNumber}</span>
              </a>
            </div>
          </motion.div>

          {/* بطاقة الموقع الثابتة (بلا تضمين خريطة فعلي) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-2 relative h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-amber-500/10 luxury-shadow group flex items-center justify-center bg-zinc-900/40"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08),transparent_70%)]"></div>
            <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-transparent transition-colors pointer-events-none"></div>
            <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" strokeWidth={1.5} />
              </div>
              <p className="text-white font-amiri text-xl sm:text-2xl md:text-3xl font-bold">
                قمحانة، حماة
              </p>
              <p className="text-zinc-400 text-sm sm:text-base max-w-sm">{address}</p>
              <a
                href={mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-bold text-sm sm:text-base transition-colors"
              >
                <Navigation className="w-4 h-4" />
                عرض الموقع على الخريطة
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
