import React from 'react';
import { CustomerReviews } from '../components/CustomerReviews';
import { CustomMixtures } from '../components/CustomMixtures';
import { FAQ } from '../components/FAQ';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Location } from '../components/Location';
import { Products } from '../components/Products';
import { Quality } from '../components/Quality';
import { ScrollProgressBar } from '../components/ScrollProgressBar';
import { SpecialOffers } from '../components/SpecialOffers';
import { Stats } from '../components/Stats';
import { Story } from '../components/Story';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { Meta } from '../components/Meta';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen selection:bg-amber-500/30 overflow-x-hidden bg-zinc-950 text-zinc-100">
      <Meta
        title="عسل الهيثم - عسل  طبيعي 100% من مراعي سوريا |  أفضل عسل سوري مع ضمانات جودة"
        description="تسوق أفضل أنواع العسل الطبيعي، عسل حبة البركة، عسل الدردار، وعسل الجيجان. مفحوص مخبرياً ومكفول. شحن آمن لكل المحافظات السورية."
        keywords="عسل, عسل طبيعي, عسل سوريا, عسل حبة البركة, غذاء ملكي, عكبر, الهيثم للعسل"
      />
      <ScrollProgressBar />
      <Header />
      <main id="main-content">
        <Hero />
        <Stats />
        <Story />
        <Products />
        <CustomMixtures isTeaser={true} />
        <SpecialOffers />
        <Quality isTeaser={true} />
        <CustomerReviews />
        <WhyChooseUs />
        <FAQ limit={3} />
        <Location />
      </main>
      <Footer />
    </div>
  );
};

