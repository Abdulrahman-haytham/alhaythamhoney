
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Story } from '../components/Story';
import { Mission } from '../components/Mission';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 bg-zinc-950 min-h-screen">
      <Helmet>
        <title>قصتنا - الهيثم لنحل وعسل | إرث عائلي منذ 1997</title>
        <meta name="description" content="تعرف على حكاية عسل الهيثم. إرث عائلي في تربية النحل وإنتاج العسل الطبيعي في سوريا منذ عام 1997." />
      </Helmet>
      
      <div className="container mx-auto px-4 sm:px-6 mb-8">
        <Breadcrumbs items={[{ label: 'قصتنا' }]} />
      </div>

      <Story />
      <Mission />
    </div>
  );
};
