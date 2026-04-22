import React from 'react';
import { motion } from 'framer-motion';
import { Beaker, Zap, ShieldCheck, Scale, Sparkles, MessageCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWhatsAppLink } from '../config/site';

interface CustomMixturesProps {
  isTeaser?: boolean;
}

export const CustomMixtures: React.FC<CustomMixturesProps> = ({ isTeaser }) => {
  const mixtures = [
    {
      title: 'خلطات للطاقة والتحمّل',
      icon: Zap,
      description: 'لتعزيز النشاط البدني والذهني وزيادة قوة التحمل.'
    },
    {
      title: 'خلطات للمناعة والتعب',
      icon: ShieldCheck,
      description: 'لتقوية دفاعات الجسم الطبيعية ومحاربة الإجهاد المستمر.'
    },
    {
      title: 'خلطات للتوازن الحيوي والخصوبة',
      icon: Scale,
      description: 'لدعم الصحة الإنجابية وإعادة التوازن لنظام الجسم.'
    },
    {
      title: 'خلطات حسب الحاجة',
      icon: Sparkles,
      description: 'تركيبة خاصة تُصمم بالكامل بناءً على متطلباتك الفريدة.'
    }
  ];

  const displayedMixtures = isTeaser ? mixtures.slice(0, 2) : mixtures;

  return (
    <section className="py-16 sm:py-24 bg-zinc-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-900/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-900/30 to-transparent"></div>
      <div className="absolute top-1/2 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2"></div>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Content Side */}
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-right order-2 lg:order-1"
          >
            <div className="inline-flex items-center gap-2 mb-4 justify-end w-full lg:justify-start lg:flex-row-reverse">
              <Beaker className="w-6 h-6 text-amber-500" />
              <span className="text-amber-500 font-bold tracking-[0.2em] uppercase text-xs italic">
                Customized Mixtures
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-amiri font-bold mb-6 text-white leading-tight">
              خلطات خُصّصت لك... <br />
              <span className="text-amber-500">لا للجميع</span> 🍯
            </h2>

            <div className="space-y-6 text-zinc-300 text-lg leading-relaxed font-light">
              <p>
                لأن الاحتياجات تختلف، نُحضّر في <span className="text-amber-400 font-medium">مناحل الهيثم</span> خلطات نحل تُصمَّم حسب الهدف والحالة، لا بوصفات جاهزة ولا بإنتاج جماعي.
              </p>
              <p>
                نختار المكوّنات ونضبط الجرعات بخبرة نحّال، وبما ينسجم مع طبيعة الجسم والاحتياج الفعلي.
              </p>
            </div>

            {/* Note Box */}
            <div className="mt-8 bg-amber-900/20 border border-amber-500/20 rounded-xl p-6 relative">
              <div className="absolute -top-3 -right-3 bg-zinc-900 border border-amber-500/30 p-2 rounded-full">
                <MessageCircle className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-amber-200/90 text-sm leading-relaxed font-medium">
                📌 يتم تحضير الخلطة بعد تواصل مباشر، لأن الجودة الحقيقية لا تُصنع للجميع.
              </p>
            </div>

            <div className="mt-8">
              {isTeaser ? (
                <Link 
                  to="/custom-mixtures"
                  className="inline-flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 text-zinc-900 font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-amber-500/20 w-full sm:w-auto"
                >
                  <span>اكتشف المزيد عن الخلطات</span>
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              ) : (
                <a 
                  href={getWhatsAppLink()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 text-zinc-900 font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-amber-500/20 w-full sm:w-auto"
                >
                  <span>اطلب خلطتك الخاصة الآن</span>
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
            </div>
          </motion.div>

          {/* Cards Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 order-1 lg:order-2">
            {displayedMixtures.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-zinc-950/50 border border-zinc-800 hover:border-amber-500/30 rounded-2xl p-6 group transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-500/10 transition-colors">
                  <item.icon className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
            {isTeaser && (
               <motion.div
               initial={false}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.3 }}
               className="bg-zinc-950/50 border border-dashed border-zinc-800 hover:border-amber-500/30 rounded-2xl p-6 group transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer"
             >
               <Link to="/custom-mixtures" className="flex flex-col items-center w-full h-full">
                  <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-500/10 transition-colors">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">والمزيد...</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">اكتشف جميع الخلطات المتاحة</p>
               </Link>
             </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
