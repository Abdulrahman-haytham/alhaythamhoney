
import React, { useEffect } from 'react';
import { FAQ } from '../components/FAQ';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Meta } from '../components/Meta';

export const FAQPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 bg-zinc-950 min-h-screen">
      <Meta
        title="الأسئلة الشائعة - الهيثم نحل و عسل"
        description="إجابات على الأسئلة الأكثر شيوعاً حول منتجات عسل الهيثم، الشحن، وطرق الاستخدام."
      />
      
      <div className="container mx-auto px-4 sm:px-6 mb-8">
        <Breadcrumbs items={[{ label: 'الأسئلة الشائعة' }]} />
      </div>

      <FAQ />
    </div>
  );
};
