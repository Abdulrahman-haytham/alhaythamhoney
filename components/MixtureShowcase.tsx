import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Scale, Sparkles } from 'lucide-react';

export const MixtureShowcase: React.FC = () => {
  const categories = [
    {
      title: 'الطاقة والتحمّل',
      icon: Zap,
      description: 'لتعزيز النشاط البدني والذهني وزيادة قوة التحمل.'
    },
    {
      title: 'المناعة والتعب',
      icon: ShieldCheck,
      description: 'لتقوية دفاعات الجسم الطبيعية ومحاربة الإجهاد المستمر.'
    },
    {
      title: 'التوازن والخصوبة',
      icon: Scale,
      description: 'لدعم الصحة الإنجابية وإعادة التوازن لنظام الجسم.'
    },
    {
      title: 'حسب الحاجة',
      icon: Sparkles,
      description: 'تركيبة خاصة تُصمم بالكامل بناءً على متطلباتك الفريدة.'
    }
  ];

  return (
    <section className="py-16 bg-zinc-900/50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-amiri font-bold text-white mb-4">تخصصاتنا</h2>
          <div className="h-1 w-20 bg-amber-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 rounded-2xl p-6 group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-amber-500/10"
            >
              <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                <item.icon className="w-7 h-7 text-amber-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-500 transition-colors">{item.title}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
