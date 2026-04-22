import React, { useEffect, useState, useCallback } from 'react';
import { SmartMixtureAssistant, StepData, Recommendation } from '../components/SmartMixtureAssistant';
import { MixturePhilosophy } from '../components/MixturePhilosophy';
import { MixtureShowcase } from '../components/MixtureShowcase';
import { MixtureCTA } from '../components/MixtureCTA';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Meta } from '../components/Meta';

export const CustomMixturesPage: React.FC = () => {
  const [mixtureData, setMixtureData] = useState<StepData>({});
  const [recommendation, setRecommendation] = useState<Recommendation | undefined>(undefined);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAssistantUpdate = useCallback((data: StepData, rec: Recommendation) => {
    setMixtureData(data);
    setRecommendation(rec);
  }, []);

  return (
    <div className="pt-24 bg-zinc-950 min-h-screen">
      <Meta
        title="الخلطات الخاصة - الهيثم نحل و عسل | خلطات علاجية ومقوية"
        description="اكتشف خلطات العسل الخاصة من الهيثم. خلطات علاجية ومقوية للجسم، محضرة بعناية من العسل الطبيعي والمكملات الغذائية."
      />
      
      <div className="container mx-auto px-4 sm:px-6 mb-8">
        <Breadcrumbs items={[{ label: 'الخلطات الخاصة' }]} />
      </div>

      {/* 1. THE INTERACTIVE HOOK */}
      <div className="container mx-auto px-4 sm:px-6 mb-8">
        <SmartMixtureAssistant onDataUpdate={handleAssistantUpdate} />
      </div>

      {/* 2. THE PHILOSOPHY */}
      <MixturePhilosophy />

      {/* 3. THE SHOWCASE */}
      <MixtureShowcase />

      {/* 4. THE FINAL CTA */}
      <MixtureCTA mixtureData={mixtureData} recommendation={recommendation} />
    </div>
  );
};
