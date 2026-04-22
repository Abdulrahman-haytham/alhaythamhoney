import React from 'react';
import { Send } from 'lucide-react';
import { StepData, Recommendation, Goal, Age } from './SmartMixtureAssistant';
import { getWhatsAppLink } from '../config/site';

interface MixtureCTAProps {
  mixtureData?: StepData;
  recommendation?: Recommendation;
}

const goalsLabels: Record<Goal, string> = {
  'Immunity': 'رفع المناعة',
  'Energy': 'طاقة ونشاط',
  'Fertility': 'دعم الخصوبة',
  'General Health': 'صحة عامة',
};

const agesLabels: Record<Age, string> = {
  'Child': 'طفل (3-12)',
  'Adult': 'بالغ (18-60)',
  'Senior': 'كبير السن (60+)',
};

export const MixtureCTA: React.FC<MixtureCTAProps> = ({ mixtureData, recommendation }) => {
  let whatsappMessage = "مرحباً الهيثم نحل و عسل، أرغب في طلب خلطة خاصة.";

  if (mixtureData && recommendation && (mixtureData.goal || mixtureData.age)) {
    whatsappMessage = `مرحباً الهيثم نحل و عسل، لقد استخدمت المساعد الذكي وأرغب في استشارة النحال لطلب خلطة:
- الهدف: ${mixtureData.goal ? goalsLabels[mixtureData.goal] : 'غير محدد'}
- العمر: ${mixtureData.age ? agesLabels[mixtureData.age] : 'غير محدد'}
- حساسية: ${mixtureData.allergy === 'Yes' ? 'نعم' : 'لا'}
- التوصية المقترحة: ${recommendation.name} (${recommendation.ingredients})

هل يمكن تأكيد الطلب؟`;
  }

  const whatsappLink = getWhatsAppLink(whatsappMessage);

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
