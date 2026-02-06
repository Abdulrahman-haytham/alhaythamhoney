
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
import { Store } from './pages/Store'; // Keeping for reference if needed, but using ShopPage
import { ShopPage } from './pages/ShopPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CustomMixturesPage } from './pages/CustomMixturesPage';
import { AboutPage } from './pages/AboutPage';
import { QualityPage } from './pages/QualityPage';
import { FAQPage } from './pages/FAQPage';
import { BlogPage } from './pages/BlogPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { ReturnPolicyPage } from './pages/ReturnPolicyPage';
import { ScrollToTop } from './components/ScrollToTop';
import { FAQ } from './components/FAQ';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { HelmetProvider, Helmet } from 'react-helmet-async';

const PageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen selection:bg-amber-500/30 overflow-x-hidden bg-zinc-950 text-zinc-100">
    <Header />
    <main>{children}</main>
    <Footer />
  </div>
);

const HomePage: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen selection:bg-amber-500/30 overflow-x-hidden bg-zinc-950 text-zinc-100">
      <Helmet>
        <title>عسل الهيثم - عسل طبيعي 100% من مراعي سوريا | ضمان الجودة</title>
        <meta name="description" content="تسوق أفضل أنواع العسل الطبيعي، عسل حبة البركة، عسل الدردار، وعسل الجيجان. مفحوص مخبرياً ومكفول. شحن آمن لكل المحافظات السورية." />
        <meta name="keywords" content="عسل, عسل طبيعي, عسل سوريا, عسل حبة البركة, غذاء ملكي, عكبر, الهيثم للعسل" />
      </Helmet>
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
        <CustomMixtures isTeaser={true} />

        {/* 4.5. عروض خاصة */}
        <SpecialOffers />
        
        {/* 7. لماذا يثق بنا من جرّبنا؟ - معايير الجودة */}
        <Quality isTeaser={true} />

        {/* 8. آراء العملاء */}
        <CustomerReviews />

        {/* 9. شهادات الجودة - Removed from Home to reduce clutter, available in Quality Page */}
        {/* <Certificates /> */}

        {/* 10. لماذا نحن */}
        <WhyChooseUs />

        {/* الأسئلة الشائعة */}
        <FAQ limit={3} />

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
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <FloatingWhatsApp />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<PageLayout><ShopPage /></PageLayout>} />
          <Route path="/store" element={<PageLayout><ShopPage /></PageLayout>} />
          <Route path="/product/:slug" element={<PageLayout><ProductDetailsPage /></PageLayout>} />
          <Route path="/custom-mixtures" element={<PageLayout><CustomMixturesPage /></PageLayout>} />
          <Route path="/about-us" element={<PageLayout><AboutPage /></PageLayout>} />
          <Route path="/quality-standards" element={<PageLayout><QualityPage /></PageLayout>} />
          <Route path="/faq" element={<PageLayout><FAQPage /></PageLayout>} />
          {/* <Route path="/blog" element={<PageLayout><BlogPage /></PageLayout>} /> */}
          
          <Route path="/articles" element={<PageLayout><ArticlesPage /></PageLayout>} />
          <Route path="/articles/:articleId" element={<PageLayout><ArticleDetailPage /></PageLayout>} />
          <Route path="/return-policy" element={<PageLayout><ReturnPolicyPage /></PageLayout>} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
};

export default App;
