
import React from 'react';
import { Microscope, Mountain, PackageCheck, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface QualityProps {
  isTeaser?: boolean;
}

export const Quality: React.FC<QualityProps> = ({ isTeaser }) => {
  const factors = [
    {
      title: 'انتقاء المرعى',
      desc: 'نتنقل خلف مواسم الزهور في جبال ووديان سوريا لنقطف أفضل الرحيق وأكثره نقاءً، بعيداً عن ملوثات المدن.',
      icon: <Mountain className="w-8 h-8 text-amber-500" />
    },
    {
      title: 'فحص مخبري مستقل',
      desc: 'فحص السكروز، الحموضة، والإنزيمات لتأكل مطمئنًا. نضمن لك النقاء بالدليل العلمي القاطع.',
      icon: <Microscope className="w-8 h-8 text-amber-500" />
    },
    {
      title: 'تعبئة آمنة',
      desc: 'شروط صحية وتغليف يحافظ على جودة العسل وخصائصه الحيوية. يصلك كما خرج من المنحل تماماً.',
      icon: <PackageCheck className="w-8 h-8 text-amber-500" />
    }
  ];

  return (
    <section id="quality" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-zinc-900/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-900/30 to-transparent"></div>
      
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 md:mb-24"
        >
          <span className="text-amber-500 font-bold mb-3 md:mb-4 block tracking-[0.3em] sm:tracking-[0.4em] uppercase text-[10px] sm:text-xs italic">Quality Standards</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-amiri font-bold mb-4 md:mb-6 px-2">شهادة عملائنا هي فخرنا وإرثنا هو الضمان</h2>
          <p className="text-zinc-500 text-base sm:text-lg md:text-xl font-light px-4">معايير لا نساوم عليها لأن صحتك هي أمانتنا</p>
          <div className="w-20 sm:w-24 h-1 bg-amber-500 mx-auto mt-6 md:mt-8 rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 md:gap-16 mb-12">
          {factors.map((f, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-zinc-950 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mb-6 sm:mb-8 md:mb-10 border border-amber-900/20 group-hover:border-amber-500/50 group-hover:-translate-y-2 transition-all duration-500 luxury-shadow">
                <div className="scale-75 sm:scale-90 md:scale-100">{f.icon}</div>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-5 md:mb-6 group-hover:text-amber-500 transition-colors">{f.title}</h3>
              <p className="text-zinc-400 leading-relaxed font-light text-sm sm:text-base md:text-lg px-2">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {isTeaser && (
          <div className="text-center">
            <Link 
              to="/quality-standards" 
              className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-4 rounded-xl border border-zinc-800 hover:border-amber-500/50 transition-all duration-300 group"
            >
              <span>اطلاع على الشهادات والمعايير</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
