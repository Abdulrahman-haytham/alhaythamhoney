import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const MixturePhilosophy: React.FC = () => {
  return (
    <section className="py-16 bg-zinc-950 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-amiri font-bold mb-8 text-white leading-tight">
            خلطات خُصّصت لك... <br />
            <span className="text-amber-500">لا للجميع</span> 🍯
          </h2>

          <div className="space-y-6 text-zinc-300 text-lg md:text-xl leading-relaxed font-light mb-10">
            <p>
              لأن الاحتياجات تختلف، نُحضّر في <span className="text-amber-400 font-medium">مناحل الهيثم</span> خلطات نحل تُصمَّم حسب الهدف والحالة، لا بوصفات جاهزة ولا بإنتاج جماعي.
            </p>
            <p>
              نختار المكوّنات ونضبط الجرعات بخبرة نحّال، وبما ينسجم مع طبيعة الجسم والاحتياج الفعلي.
            </p>
          </div>

          <div className="inline-block bg-amber-900/20 border border-amber-500/20 rounded-xl p-6 relative mx-auto max-w-2xl">
            <div className="absolute -top-3 -right-3 bg-zinc-900 border border-amber-500/30 p-2 rounded-full">
              <MessageCircle className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-amber-200/90 text-base md:text-lg leading-relaxed font-medium">
              📌 يتم تحضير الخلطة بعد تواصل مباشر، لأن الجودة الحقيقية لا تُصنع للجميع.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
