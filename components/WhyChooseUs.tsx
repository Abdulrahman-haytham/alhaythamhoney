import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const comparisons = [
    {
      feature: 'الجودة',
      us: 'عسل طبيعي 100% مفحوص مخبرياً',
      others: 'قد يحتوي على إضافات أو سكر'
    },
    {
      feature: 'الخبرة',
      us: '25+ عاماً من الخبرة العائلية',
      others: 'تجار جدد أو محدودو الخبرة'
    },
    {
      feature: 'الضمان',
      us: 'ضمان الجودة أو استرداد المال',
      others: 'لا يوجد ضمان واضح'
    },
    {
      feature: 'المصدر',
      us: 'من مراعي سوريا الطبيعية',
      others: 'مصادر غير واضحة'
    }
  ];

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-900/30 to-transparent"></div>
      
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-amber-500" />
            <span className="text-amber-500 font-bold tracking-[0.4em] uppercase text-xs italic">
              Why Choose Us
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-amiri font-bold mb-6 text-white">
            لماذا الهيثم لنحل وعسل؟
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            مقارنة سريعة توضح الفرق بيننا وبين الآخرين
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="text-center md:text-right">
              <h3 className="text-zinc-500 text-sm font-bold mb-4 uppercase tracking-wider">الميزة</h3>
            </div>
            <div className="text-center bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <h3 className="text-amber-400 font-amiri font-bold text-xl mb-2">الهيثم</h3>
              <p className="text-zinc-400 text-xs">نحن</p>
            </div>
            <div className="text-center bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-zinc-500 font-bold text-lg mb-2">الآخرون</h3>
              <p className="text-zinc-600 text-xs">منافسون</p>
            </div>
          </div>

          {comparisons.map((comp, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
            >
              <div className="flex items-center justify-center md:justify-end">
                <span className="text-zinc-300 font-medium">{comp.feature}</span>
              </div>
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-xl p-6 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <p className="text-zinc-200 text-sm leading-relaxed">{comp.us}</p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex items-center gap-3">
                <XCircle className="w-6 h-6 text-zinc-600 flex-shrink-0" />
                <p className="text-zinc-500 text-sm leading-relaxed">{comp.others}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <a
            href="https://wa.me/963930112994?text=أريد طلب عسل طبيعي من الهيثم"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 rounded-full font-black hover:from-amber-400 hover:to-amber-500 transition-all duration-300 hover:scale-105 text-xl shadow-lg shadow-amber-500/20"
          >
            🍯 اختبر الفرق بنفسك - اطلب الآن
          </a>
        </motion.div>
      </div>
    </section>
  );
};
