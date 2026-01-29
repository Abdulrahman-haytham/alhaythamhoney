
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Story } from './components/Story';
import { Stats } from './components/Stats';
import { Products } from './components/Products';
import { CustomMixtures } from './components/CustomMixtures';
import { Quality } from './components/Quality';
import { CustomerReviews } from './components/CustomerReviews';
import { Certificates } from './components/Certificates';
import { WhyChooseUs } from './components/WhyChooseUs';
import { SpecialOffers } from './components/SpecialOffers';
import { Location } from './components/Location';
import { Footer } from './components/Footer';
import { Store } from './pages/Store';
import { ProductPage } from './pages/ProductPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { ReturnPolicyPage } from './pages/ReturnPolicyPage';
import { ScrollToTop } from './components/ScrollToTop';

const HomePage: React.FC = () => {
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
        
        {/* قسم الخلطات الخاصة */}
        <CustomMixtures />

        {/* 4.5. عروض خاصة */}
        <SpecialOffers />
        
        {/* 7. لماذا يثق بنا من جرّبنا؟ - معايير الجودة */}
        <Quality />

        {/* 8. آراء العملاء */}
        <CustomerReviews />

        {/* 9. شهادات الجودة */}
        <Certificates />

        {/* 10. لماذا نحن */}
        <WhyChooseUs />

        {/* قسم الموقع الجغرافي */}
        <Location />
      </main>
      
      {/* 8 + 9. الخاتمة والفوتر */}
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/store" element={
          <div className="min-h-screen selection:bg-amber-500/30 overflow-x-hidden bg-zinc-950 text-zinc-100">
            <Header />
            <Store />
            <Footer />
          </div>
        } />
        <Route path="/product/:productId" element={
          <div className="min-h-screen selection:bg-amber-500/30 overflow-x-hidden bg-zinc-950 text-zinc-100">
            <ProductPage />
          </div>
        } />
        <Route path="/articles" element={
          <div className="min-h-screen selection:bg-amber-500/30 overflow-x-hidden bg-zinc-950 text-zinc-100">
            <Header />
            <ArticlesPage />
            <Footer />
          </div>
        } />
        <Route path="/articles/:articleId" element={
          <div className="min-h-screen selection:bg-amber-500/30 overflow-x-hidden bg-zinc-950 text-zinc-100">
            <ArticleDetailPage />
          </div>
        } />
        <Route path="/return-policy" element={
          <div className="min-h-screen selection:bg-amber-500/30 overflow-x-hidden bg-zinc-950 text-zinc-100">
            <Header />
            <ReturnPolicyPage />
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;
