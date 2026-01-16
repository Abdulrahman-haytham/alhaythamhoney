import React from 'react';
import { motion } from 'framer-motion';
import { Award, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';

export const Certificates: React.FC = () => {
  const certificates = [
    {
      title: 'شهادة الفحص المخبري',
      description: 'فحص شامل للجودة والنقاء',
      icon: <FileCheck className="w-8 h-8 text-amber-500" />
    },
    {
      title: 'عسل طبيعي 100%',
      description: 'موثق ومضمون الجودة',
      icon: <ShieldCheck className="w-8 h-8 text-amber-500" />
    },
    {
      title: 'خبرة 25+ عاماً',
      description: 'إرث عائلي موثوق',
      icon: <Award className="w-8 h-8 text-amber-500" />
    },
    {
      title: 'ضمان الجودة',
      description: 'نضمن رضاكم أو استرداد المال',
      icon: <CheckCircle2 className="w-8 h-8 text-amber-500" />
    }
  ];

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-gradient-to-b from-zinc-950 via-zinc-900/50 to-zinc-950 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full"></div>
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full"></div>
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-amber-500" />
            <span className="text-amber-500 font-bold tracking-[0.4em] uppercase text-xs italic">
              Certifications & Guarantees
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-amiri font-bold mb-6 text-white">
            شهادات الجودة والضمانات
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            ثقتكم هي أمانتنا - نضع اسمنا ضماناً لكل قطرة عسل
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {certificates.map((cert, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-sm rounded-2xl p-8 border border-amber-500/20 hover:border-amber-500/50 transition-all duration-500 hover:scale-105"
            >
              {/* Golden Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:via-amber-500/5 group-hover:to-amber-500/0 rounded-2xl transition-all duration-500"></div>
              
              <div className="relative z-10">
                <div className="mb-6 flex justify-center">
                  <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 group-hover:bg-amber-500/20 transition-all duration-300">
                    {cert.icon}
                  </div>
                </div>
                <h3 className="text-xl font-amiri font-bold text-white mb-3 text-center group-hover:text-amber-400 transition-colors">
                  {cert.title}
                </h3>
                <p className="text-zinc-400 text-sm text-center leading-relaxed">
                  {cert.description}
                </p>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-amber-500/20 rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-amber-500/20 rounded-bl-2xl"></div>
            </motion.div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border border-amber-500/30 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-amiri font-bold text-white mb-4">
            ضمان الجودة الكامل
          </h3>
          <p className="text-zinc-300 text-lg mb-6">
            نضمن أن كل منتج من منتجاتنا هو 100% عسل طبيعي مفحوص مخبرياً. 
            <br />
            <span className="text-amber-400 font-bold">إذا لم تكن راضياً، نعيد لك المال كاملاً.</span>
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-zinc-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              ضمان الجودة
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              استرداد المال
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              شحن آمن
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
