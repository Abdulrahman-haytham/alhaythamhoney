
import React from 'react';
import { Microscope, Mountain, PackageCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const Quality: React.FC = () => {
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
    <section id="quality" className="py-32 px-6 bg-zinc-900/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-900/30 to-transparent"></div>
      
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <span className="text-amber-500 font-bold mb-4 block tracking-[0.4em] uppercase text-xs italic">Quality Standards</span>
          <h2 className="text-4xl md:text-5xl font-amiri font-bold mb-6">لماذا يثق بنا من جرّبنا؟</h2>
          <p className="text-zinc-500 text-xl font-light">معايير لا نساوم عليها لأن صحتك هي أمانتنا</p>
          <div className="w-24 h-1 bg-amber-500 mx-auto mt-8 rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {factors.map((f, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center mb-10 border border-amber-900/20 group-hover:border-amber-500/50 group-hover:-translate-y-2 transition-all duration-500 luxury-shadow">
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold mb-6 group-hover:text-amber-500 transition-colors">{f.title}</h3>
              <p className="text-zinc-400 leading-relaxed font-light text-lg">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
