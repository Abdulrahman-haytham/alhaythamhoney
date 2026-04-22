import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, ShieldAlert, Sparkles, Activity, Heart, User, AlertCircle, Send } from 'lucide-react';
import { getWhatsAppLink } from '../config/site';

// Types
export type Goal = 'Immunity' | 'Energy' | 'Fertility' | 'General Health';
export type Age = 'Child' | 'Adult' | 'Senior';
export type Allergy = 'Yes' | 'No';

export interface StepData {
  goal?: Goal;
  age?: Age;
  allergy?: Allergy;
}

export interface Recommendation {
  name: string;
  ingredients: string;
  desc: string;
  safe: boolean;
}

interface SmartMixtureAssistantProps {
  onDataUpdate?: (data: StepData, recommendation: Recommendation) => void;
}

// Data Options
const goals: { id: Goal; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'Immunity', label: 'رفع المناعة', icon: <ShieldAlert className="w-6 h-6" />, desc: 'تعزيز دفاعات الجسم الطبيعية' },
  { id: 'Energy', label: 'طاقة ونشاط', icon: <Activity className="w-6 h-6" />, desc: 'محاربة التعب وزيادة الحيوية' },
  { id: 'Fertility', label: 'دعم الخصوبة', icon: <Sparkles className="w-6 h-6" />, desc: 'تحسين الصحة الإنجابية' },
  { id: 'General Health', label: 'صحة عامة', icon: <Heart className="w-6 h-6" />, desc: 'حفاظ على توازن الجسم اليومي' },
];

const ages: { id: Age; label: string; desc: string }[] = [
  { id: 'Child', label: 'طفل (3-12)', desc: 'تركيبات خفيفة ومناسبة للنمو' },
  { id: 'Adult', label: 'بالغ (18-60)', desc: 'تركيبات بتركيز قياسي' },
  { id: 'Senior', label: 'كبير السن (60+)', desc: 'تركيبات داعمة ومقوية' },
];

const allergies: { id: Allergy; label: string }[] = [
  { id: 'No', label: 'لا يوجد حساسية' },
  { id: 'Yes', label: 'نعم، لدي حساسية' },
];

export const SmartMixtureAssistant: React.FC<SmartMixtureAssistantProps> = ({ onDataUpdate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<StepData>({});
  const [showResult, setShowResult] = useState(false);

  // Logic Engine
  const getRecommendation = (currentData: StepData): Recommendation => {
    if (currentData.allergy === 'Yes') {
      return {
        name: 'خلطة خاصة آمنة',
        ingredients: 'عسل طبيعي صافي 100% (بدون حبوب لقاح أو عكبر)',
        desc: 'نظراً لوجود حساسية، ننصح بخلطة مخصصة خالية من منتجات النحل التي قد تسبب تحسساً.',
        safe: true,
      };
    }

    if (currentData.goal === 'Fertility') {
      return {
        name: 'إكسير الحياة (Elixir of Life)',
        ingredients: 'عسل + غذاء ملكي + حبوب لقاح + أعشاب خاصة',
        desc: 'تركيبة قوية مصممة خصيصاً لدعم الصحة الإنجابية والنشاط الهرموني.',
        safe: false,
      };
    }

    if (currentData.goal === 'Energy') {
      return {
        name: 'الخلطة السوداء (Black Power)',
        ingredients: 'عسل + حبوب لقاح + غذاء ملكي',
        desc: 'مصدر طاقة فوري ومستدام للرياضيين وأصحاب المجهود العالي.',
        safe: false,
      };
    }

    if (currentData.goal === 'Immunity') {
      if (currentData.age === 'Child') {
        return {
          name: 'خلطة البطل الصغير',
          ingredients: 'عسل + عكبر مخفف (Propolis)',
          desc: 'حماية لطيفة وفعالة لمناعة الأطفال في طور النمو.',
          safe: false,
        };
      } else {
        return {
          name: 'درع المناعة (Immunity Shield)',
          ingredients: 'عسل + عكبر + غذاء ملكي',
          desc: 'حصن منيع ضد العدوى الموسمية وتعزيز للصحة العامة.',
          safe: false,
        };
      }
    }

    // Default / General Health
    return {
      name: 'خلطة الحيوية اليومية',
      ingredients: 'عسل + حبوب لقاح',
      desc: 'دعم يومي متوازن للفيتامينات والمعادن والنشاط العام.',
      safe: false,
    };
  };

  const recommendation = getRecommendation(data);

  useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate(data, recommendation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, onDataUpdate]);

  // Helper to go back
  const prevStep = () => {
    if (showResult) {
      setShowResult(false);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Helper to go to next step
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };


  // WhatsApp Link Generator
  const whatsappMessage = `مرحباً الهيثم لنحل وعسل، لقد استخدمت المساعد الذكي وأرغب في استشارة النحال:
- الهدف: ${goals.find(g => g.id === data.goal)?.label || data.goal}
- العمر: ${ages.find(a => a.id === data.age)?.label || data.age}
- حساسية: ${data.allergy === 'Yes' ? 'نعم' : 'لا'}
- التوصية: ${recommendation.name}
هل يمكن تأكيد المكونات والطلب؟`;

  const whatsappLink = getWhatsAppLink(whatsappMessage);

  return (
    <section className="py-16 px-4 bg-zinc-900/50 my-12 rounded-3xl border border-zinc-800 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-2 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-amber-500 text-sm font-bold">مساعد اختيار الخلطة الذكي</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-amiri font-bold text-white mb-4">
            دعنا نختار الخلطة المثالية لك
          </h2>
          <p className="text-zinc-400">
            أجب عن 3 أسئلة بسيطة للحصول على توصية مخصصة من خبير العسل
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 relative h-1 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            className="absolute top-0 right-0 h-full bg-gradient-to-l from-amber-600 to-yellow-400"
            initial={{ width: '33%' }}
            animate={{ width: showResult ? '100%' : `${(currentStep / 3) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key="wizard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Goal */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-amiri font-bold text-white text-center mb-8">
                      ما هو هدفك الصحي الأساسي؟
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {goals.map((goal) => (
                        <button
                          key={goal.id}
                          onClick={() => { setData({ ...data, goal: goal.id }); nextStep(); }}
                          className={`p-6 rounded-2xl border transition-all duration-300 flex items-start gap-4 text-right group hover:scale-[1.02] ${
                            data.goal === goal.id 
                              ? 'bg-amber-500/20 border-amber-500 ring-1 ring-amber-500/50' 
                              : 'bg-zinc-900 border-zinc-800 hover:border-amber-500/30 hover:bg-zinc-800'
                          }`}
                        >
                          <div className={`p-3 rounded-xl ${data.goal === goal.id ? 'bg-amber-500 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:text-amber-500'}`}>
                            {goal.icon}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white mb-1">{goal.label}</h4>
                            <p className="text-sm text-zinc-400">{goal.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Age */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-amiri font-bold text-white text-center mb-8">
                      لمن هذه الخلطة؟
                    </h3>
                    <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto">
                      {ages.map((age) => (
                        <button
                          key={age.id}
                          onClick={() => { setData({ ...data, age: age.id }); nextStep(); }}
                          className={`p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between group hover:scale-[1.02] ${
                            data.age === age.id 
                              ? 'bg-amber-500/20 border-amber-500 ring-1 ring-amber-500/50' 
                              : 'bg-zinc-900 border-zinc-800 hover:border-amber-500/30 hover:bg-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${data.age === age.id ? 'bg-amber-500/20 text-amber-500' : 'bg-zinc-800 text-zinc-400'}`}>
                              <User className="w-5 h-5" />
                            </div>
                            <div className="text-right">
                              <h4 className="text-lg font-bold text-white">{age.label}</h4>
                              <p className="text-sm text-zinc-400">{age.desc}</p>
                            </div>
                          </div>
                          <ChevronLeft className={`w-5 h-5 transition-transform ${data.age === age.id ? 'text-amber-500 -translate-x-1' : 'text-zinc-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Allergy */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-amiri font-bold text-white text-center mb-8">
                      هل يوجد حساسية من منتجات النحل؟
                    </h3>
                    <p className="text-center text-zinc-400 -mt-6 mb-8 max-w-md mx-auto">
                      (مثل الحساسية من لسع النحل، أو حبوب اللقاح)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                      {allergies.map((allergy) => (
                        <button
                          key={allergy.id}
                          onClick={() => { setData({ ...data, allergy: allergy.id }); nextStep(); }}
                          className={`p-8 rounded-2xl border transition-all duration-300 text-center group hover:scale-[1.02] ${
                            data.allergy === allergy.id 
                              ? 'bg-amber-500/20 border-amber-500 ring-1 ring-amber-500/50' 
                              : 'bg-zinc-900 border-zinc-800 hover:border-amber-500/30 hover:bg-zinc-800'
                          }`}
                        >
                          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                            data.allergy === allergy.id ? 'bg-amber-500 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700'
                          }`}>
                            {allergy.id === 'Yes' ? <AlertCircle className="w-8 h-8" /> : <Check className="w-8 h-8" />}
                          </div>
                          <h4 className="text-xl font-bold text-white">{allergy.label}</h4>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons (Back) */}
                <div className="flex justify-between mt-12 pt-6 border-t border-zinc-800/50">
                  {currentStep > 1 && (
                    <button 
                      onClick={prevStep}
                      className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                      العودة للسابق
                    </button>
                  )}
                  <div className="flex-1"></div> {/* Spacer */}
                </div>
              </motion.div>
            ) : (
              // Result View
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full -mr-10 -mt-10"></div>
                
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-2">توصية الخبير</h3>
                  <h2 className="text-3xl md:text-4xl font-amiri font-bold text-white mb-6">
                    {recommendation.name}
                  </h2>
                  
                  <div className="bg-zinc-950/50 rounded-xl p-6 mb-8 border border-zinc-800 inline-block w-full max-w-xl">
                    <p className="text-lg text-zinc-300 mb-2 font-bold">المكونات:</p>
                    <p className="text-amber-400 text-xl font-amiri mb-4">{recommendation.ingredients}</p>
                    <div className="h-px w-24 bg-zinc-800 mx-auto mb-4"></div>
                    <p className="text-zinc-400 leading-relaxed">{recommendation.desc}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all hover:scale-105 shadow-lg shadow-[#25D366]/20 w-full sm:w-auto justify-center"
                    >
                      <Send className="w-5 h-5" />
                      اطلب الخلطة الآن
                    </a>
                    <button
                      onClick={() => { setShowResult(false); setCurrentStep(1); setData({}); }}
                      className="px-6 py-4 rounded-full border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all w-full sm:w-auto"
                    >
                      إعادة البدء
                    </button>
                  </div>
                  
                  <p className="mt-8 text-xs text-zinc-500 flex items-center justify-center gap-2">
                    <ShieldAlert className="w-3 h-3" />
                    هذه توصية أولية؛ استشارة النحال ضرورية لتأكيد الملاءمة الصحية.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
