
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Quality } from '../components/Quality';
import { Certificates } from '../components/Certificates';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const QualityPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 bg-zinc-950 min-h-screen">
      <Helmet>
        <title>معايير الجودة - الهيثم لنحل وعسل | ضمان الجودة والشهادات</title>
        <meta name="description" content="نلتزم بأعلى معايير الجودة في إنتاج العسل. عسل مفحوص مخبرياً ومكفول، حاصل على شهادات جودة موثقة." />
      </Helmet>
      
      <div className="container mx-auto px-4 sm:px-6 mb-8">
        <Breadcrumbs items={[{ label: 'معايير الجودة' }]} />
      </div>

      <Quality />
      <Certificates />
    </div>
  );
};
