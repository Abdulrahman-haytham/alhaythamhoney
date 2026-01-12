
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Microscope, Award, Truck } from 'lucide-react';

export const Hero: React.FC = () => {
  const phoneNumber = "963930112994";
  const trustIcons = [
    { icon: <ShieldCheck className="w-5 h-5" />, text: "طبيعي 100%" },
    { icon: <Microscope className="w-5 h-5" />, text: "مفحوص مخبرياً" },
    { icon: <Award className="w-5 h-5" />, text: "خبرة عائلية 25+ عاماً" },
    { icon: <Truck className="w-5 h-5" />, text: "شحن آمن داخل سوريا" },
  ];

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Background with subtle animation */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="https://res.cloudinary.com/dkbvnupge/image/upload/v1767958674/my-app-uploads/kromozksoa3vpcwrnvtw.jpg  " 
          alt="Golden Honey"
          className="w-full h-full object-cover grayscale-[10%] brightness-[0.3]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-block px-4 py-1 border border-amber-500/30 rounded-full mb-8 bg-amber-500/5 backdrop-blur-sm"
        >
          <span className="text-amber-500 text-xs md:text-sm font-bold tracking-widest uppercase">
            إرث عائلي موثوق منذ 1997
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-5xl md:text-8xl font-amiri font-bold text-white mb-6 leading-tight"
        >
          عسل طبيعي نقي <br />
          <span className="gold-text">من قلب الطبيعة السورية</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="max-w-2xl mx-auto text-zinc-300 text-lg md:text-2xl mb-12 font-light leading-relaxed"
        >
          نقدّم عسلًا 100% طبيعي، مفحوصًا مخبريًا، من الخلية إلى مائدتك بلا أي إضافات.
        </motion.p>

        {/* Trust Icons Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="flex flex-wrap justify-center gap-6 md:gap-10 mb-14"
        >
          {trustIcons.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-amber-200/70 text-sm md:text-base font-medium">
              <span className="text-amber-500">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="flex justify-center"
        >
          <a 
            href={`https://wa.me/${phoneNumber}`} 
            className="group relative px-12 py-5 gold-gradient rounded-full text-zinc-950 font-black text-xl luxury-shadow transition-all hover:scale-105 active:scale-95"
          >
            🍯 اطلب عبر واتساب
          </a>
        </motion.div>
      </div>

      <motion.div 
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20 hidden md:block"
      >
        <div className="w-6 h-10 border-2 border-amber-500 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-amber-500 rounded-full"></div>
        </div>
      </motion.div>
    </section>
  );
};