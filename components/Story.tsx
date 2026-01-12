
import React from 'react';
import { motion } from 'framer-motion';

export const Story: React.FC = () => {
  return (
    <section id="story" className="py-32 px-6 bg-zinc-950 relative overflow-hidden">
      <div className="absolute -right-40 top-40 w-[500px] h-[500px] bg-amber-600/5 blur-[120px] rounded-full"></div>
      
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <div className="relative z-10 rounded-[3rem] overflow-hidden luxury-shadow border border-amber-500/10 aspect-square">
            <img 
              src="https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?auto=format&fit=crop&q=80&w=1200" 
              alt="The Legacy" 
              className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700"
            />
          </div>
          <div className="absolute -bottom-10 -left-10 w-full h-full border border-amber-500/10 rounded-[3rem] -z-0 translate-x-4 translate-y-4"></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="space-y-10"
        >
          <div>
            <span className="text-amber-500 font-bold mb-4 block tracking-[0.3em] uppercase text-xs">حكاية الهيثم… حين يكون العسل مسؤولية</span>
            <h2 className="text-5xl md:text-6xl font-amiri font-bold mb-8 leading-tight">إرث يمتد عبر الأجيال</h2>
          </div>
          
          <div className="space-y-6 text-zinc-300 text-xl leading-relaxed font-light">
            <p>
              بدأت رحلتنا عام 1997 بشغف الوالد المؤسس، وباحترام عميق لعالم خلية النحل.
            </p>
            <p className="text-zinc-400">
              اليوم نتابع نحن <strong className="text-white">عبد الرحمن وتركي</strong> هذه الرسالة بنفس الأمانة، وبخبرة أعمق، محافظين على جودة لا نساوم عليها.
            </p>
          </div>

          <motion.div 
            whileInView={{ scale: [1, 1.02, 1] }}
            className="bg-zinc-900/50 p-8 border-r-4 border-amber-500 rounded-l-3xl backdrop-blur-sm"
          >
            <span className="italic block text-amber-500 font-amiri text-4xl mb-2">“</span>
            <span className="block text-white font-amiri text-3xl mb-2">
              النظافة وعد، والجودة عهد
            </span>
          </motion.div>
          
          <div className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-4">
              <div className="w-14 h-14 rounded-full border-4 border-zinc-950 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">عبد الرحمن</div>
              <div className="w-14 h-14 rounded-full border-4 border-zinc-950 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">تركي</div>
            </div>
            <div>
              <p className="text-white font-bold">بإدارة أبناء الوالد المؤسس</p>
              <p className="text-zinc-500 text-xs italic">نضع اسمنا ضماناً لكل قطرة عسل</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
