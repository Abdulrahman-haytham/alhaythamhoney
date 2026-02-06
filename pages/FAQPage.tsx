
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FAQ } from '../components/FAQ';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const FAQPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 bg-zinc-950 min-h-screen">
      <Helmet>
        <title>الأسئلة الشائعة - الهيثم لنحل وعسل</title>
        <meta name="description" content="إجابات على الأسئلة الأكثر شيوعاً حول منتجات عسل الهيثم، الشحن، وطرق الاستخدام." />
      </Helmet>
      
      <div className="container mx-auto px-4 sm:px-6 mb-8">
        <Breadcrumbs items={[{ label: 'الأسئلة الشائعة' }]} />
      </div>

      <FAQ />
    </div>
  );
};
