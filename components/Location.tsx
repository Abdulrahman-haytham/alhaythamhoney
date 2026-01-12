
import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

export const Location: React.FC = () => {
  const address = "حماة، قمحانة، جانب مسجد بلال الحبشي";
  
  return (
    <section id="location" className="py-24 px-6 bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
      
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span className="text-amber-500 text-xs font-black tracking-widest uppercase">تفضل بزيارتنا</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-amiri font-bold mb-6">موقعنا في قلب سوريا</h2>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            يسعدنا استقبالكم في مركزنا الرئيسي لتذوق أجود أنواع العسل مباشرة من المنحل.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* تفاصيل العنوان */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1 space-y-8"
          >
            <div className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-white/5 luxury-shadow">
              <h3 className="text-2xl font-amiri font-bold text-white mb-4">العنوان الدقيق</h3>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8 italic">
                {address}
              </p>
              <a 
                href="https://www.google.com/maps/search/%D8%AD%D9%85%D8%A7%D8%A9+%D9%82%D9%85%D8%AD%D8%A7%D9%86%D8%A9+%D8%AC%D8%A7%D9%86%D8%A8+%D9%85%D8%B3%D8%AC%D8%AF+%D8%A8%D9%84%D8%A7%D9%84+%D8%A7%D9%84%D8%AD%D8%A8%D8%B4%D9%8A"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 bg-amber-500 text-zinc-950 rounded-2xl font-black hover:scale-105 transition-transform"
              >
                <Navigation className="w-5 h-5" />
                فتح في خرائط جوجل
              </a>
            </div>

            <div className="bg-zinc-900/30 p-8 rounded-[2.5rem] border border-amber-500/5">
              <h4 className="text-amber-500 font-bold mb-2">أوقات الاستقبال</h4>
              <p className="text-zinc-400">يومياً من الساعة 9:00 صباحاً حتى 9:00 مساءً</p>
            </div>
          </motion.div>

          {/* الخريطة */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-2 relative h-[500px] rounded-[3rem] overflow-hidden border border-amber-500/10 luxury-shadow group"
          >
            <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-transparent transition-colors pointer-events-none z-10"></div>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13027.9!2d36.7169!3d35.2091!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1523ff0a5f4b2bdf%3A0x1b6f3c9e4e5b7a21!2z2KfZhNmF2YTZhNin2YUg2YTYqtis2YjYp9mF2Kkg2YjZhdmI2YbZitip!5e0!3m2!1sar!2s!4v1736763600000"
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'grayscale(1) invert(0.92) contrast(0.8)' }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="موقع الهيثم لنحل وعسل"
            ></iframe>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
