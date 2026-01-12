
import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Story } from './components/Story';
import { Stats } from './components/Stats';
import { Products } from './components/Products';
import { Quality } from './components/Quality';
import { Location } from './components/Location';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen selection:bg-amber-500/30 overflow-x-hidden bg-zinc-950 text-zinc-100">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 origin-[0%] z-[100]"
        style={{ scaleX }}
      />
      <Header />
      <main>
        {/* 1. الهيرو سيكشن - لحظة الحكم */}
        <Hero />
        
        {/* 2. دليل اجتماعي فوري - طمأنة العقل */}
        <Stats />
        
        {/* 3. حكاية العائلة - بناء المعنى */}
        <Story />
        
        {/* 4 + 5 + 6. المنتجات والمكملات والمختبر الملكي */}
        <Products />
        
        {/* 7. لماذا يثق بنا من جرّبنا؟ - معايير الجودة */}
        <Quality />

        {/* قسم الموقع الجغرافي */}
        <Location />
      </main>
      
      {/* 8 + 9. الخاتمة والفوتر */}
      <Footer />
    </div>
  );
};

export default App;
