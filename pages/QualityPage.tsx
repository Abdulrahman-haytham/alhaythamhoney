
import React, { useEffect } from 'react';
import { Quality } from '../components/Quality';
import { Certificates } from '../components/Certificates';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Meta } from '../components/Meta';

export const QualityPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 bg-zinc-950 min-h-screen">
      <Meta
        title="معايير الجودة - الهيثم نحل و عسل | ضمان الجودة والشهادات"
        description="نلتزم بأعلى معايير الجودة في إنتاج العسل. عسل مفحوص مخبرياً ومكفول، حاصل على شهادات جودة موثقة."
      />
      
      <div className="container mx-auto px-4 sm:px-6 mb-8">
        <Breadcrumbs items={[{ label: 'معايير الجودة' }]} />
      </div>

      <Quality />
      <Certificates />
    </div>
  );
};
