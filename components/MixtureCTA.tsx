import React from 'react';
import { Send } from 'lucide-react';
import { StepData, Recommendation } from './SmartMixtureAssistant';
import { buildMixtureLink } from '../utils/mixture';

interface MixtureCTAProps {
  mixtureData?: StepData;
  recommendation?: Recommendation;
}

export const MixtureCTA: React.FC<MixtureCTAProps> = ({ mixtureData, recommendation }) => {
  const whatsappLink = buildMixtureLink(mixtureData ?? {}, recommendation);

  return (
    <section className="py-20 bg-zinc-950 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-amiri font-bold text-white mb-8">
          جاهز لطلب خلطتك؟
        </h2>
        <p className="text-zinc-400 max-w-xl mx-auto mb-10 text-lg">
          سواء اخترت خلطتك عبر المساعد الذكي أو كنت بحاجة لاستشارة مباشرة، نحن هنا لخدمتك.
        </p>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-600 text-zinc-900 font-bold py-5 px-10 rounded-full text-xl transition-all duration-300 hover:scale-105 shadow-xl shadow-amber-500/20"
        >
          <Send className="w-6 h-6" />
          <span>اطلب خلطتك الخاصة الآن</span>
        </a>

        <p className="mt-6 text-sm text-zinc-500">
          تواصل مباشر مع خبير العسل والمناحل
        </p>
      </div>
    </section>
  );
};
