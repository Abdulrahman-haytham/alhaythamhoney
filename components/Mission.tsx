import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Shield, Sprout, HeartHandshake } from 'lucide-react';

export const Mission: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 bg-zinc-900 relative overflow-hidden">
      {/* Decorative background - kept subtle */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="container mx-auto px-4 sm:px-6">
        {/* Compact Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-2 justify-center">
            <HeartHandshake className="w-5 h-5 text-amber-500" />
            <span className="text-amber-500 font-bold tracking-[0.2em] uppercase text-[10px] sm:text-xs italic">
              Our Mission
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-amiri font-bold text-white">
            رسالتنا في الهيثم
          </h2>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-950/50 border border-amber-500/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 relative overflow-hidden"
          >
            {/* Quote marks - smaller and better positioned */}
            <div className="absolute top-2 right-4 sm:top-4 sm:right-6 text-amber-500/5 font-amiri text-6xl sm:text-8xl leading-none select-none pointer-events-none">"</div>
            
            <div className="relative z-10">
              {/* Desktop: Grid Layout to save vertical space */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
                
                {/* Column 1: Core Philosophy */}
                <div className="space-y-4 text-zinc-300 font-light">
                  <p className="font-amiri text-xl sm:text-2xl text-white leading-relaxed">
                    في الهيثم نحل وعسل، لا نبيع العسل فقط، بل نرتقي بثقافة المستهلك، ليشتري عن فهم، يميّز بوعي، ويحمي بقناعة.
                  </p>
                  <div className="h-px w-24 bg-amber-500/30 my-2 sm:my-4"></div>
                  <p className="text-sm sm:text-base leading-relaxed">
                    نؤمن أن الجهل بمنتجات النحل لا يضرّ المستهلك وحده، بل يهدّد النحل، ويقتل الإنتاج النظيف، ويفتح الباب أمام الغشّ، والاستغلال، وتشويه الحقيقة.
                  </p>
                </div>

                {/* Column 2: Action & Values */}
                <div className="space-y-4 sm:space-y-5">
                   {/* Compact Feature Items */}
                  <div className="bg-zinc-900/50 rounded-xl p-3 sm:p-4 border border-amber-500/10 hover:border-amber-500/30 transition-colors">
                    <div className="flex gap-3">
                      <div className="mt-1 bg-zinc-800/50 p-1.5 rounded-lg h-fit">
                        <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm mb-1">أمانة في أعناقنا</h3>
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">النحل ليس سلعة موسمية، إنه كائن حي، وركيزة بيئية.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/50 rounded-xl p-3 sm:p-4 border border-amber-500/10 hover:border-amber-500/30 transition-colors">
                     <div className="flex gap-3">
                      <div className="mt-1 bg-zinc-800/50 p-1.5 rounded-lg h-fit">
                        <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm mb-1">وعي وتعلّم</h3>
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">ندعو إلى التعلّم بدل التلقّي، وإلى السؤال بدل الانسياق.</p>
                      </div>
                    </div>
                  </div>

                   <p className="text-xs sm:text-sm text-zinc-400 italic border-r-2 border-amber-500/30 pr-3 mr-1 mt-2">
                    حمايته تبدأ بالوعي، وتستمر بالتعلّم، وتُترجم بدعم المنتج المحلي الحقيقي.
                  </p>
                </div>
              </div>

              {/* Bottom Bar: Responsibilities - Compact horizontal layout */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/5">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
                    <h3 className="text-amber-500 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
                      نحن مسؤولون عن:
                    </h3>
                    <div className="flex flex-wrap justify-center md:justify-end gap-x-4 sm:gap-x-6 gap-y-2 font-amiri text-base sm:text-lg text-white w-full">
                      <span className="flex items-center gap-1.5 sm:gap-2 bg-zinc-900/50 px-3 py-1 rounded-full border border-white/5">
                        <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                        نشر الوعي
                      </span>
                      <span className="flex items-center gap-1.5 sm:gap-2 bg-zinc-900/50 px-3 py-1 rounded-full border border-white/5">
                        <Sprout className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                        حماية النحل
                      </span>
                      <span className="flex items-center gap-1.5 sm:gap-2 bg-zinc-900/50 px-3 py-1 rounded-full border border-white/5">
                        <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                        صون المستهلك
                      </span>
                    </div>
                 </div>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
