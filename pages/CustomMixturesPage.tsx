
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { CustomMixtures } from '../components/CustomMixtures';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const CustomMixturesPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 bg-zinc-950 min-h-screen">
      <Helmet>
        <title>الخلطات الخاصة - الهيثم لنحل وعسل | خلطات علاجية ومقوية</title>
        <meta name="description" content="اكتشف خلطات العسل الخاصة من الهيثم. خلطات علاجية ومقوية للجسم، محضرة بعناية من العسل الطبيعي والمكملات الغذائية." />
      </Helmet>
      
      <div className="container mx-auto px-4 sm:px-6 mb-8">
        <Breadcrumbs items={[{ label: 'الخلطات الخاصة' }]} />
      </div>

      <CustomMixtures />
    </div>
  );
};
