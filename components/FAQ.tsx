import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqData = [
  {
    question: "كيف يمكنني الثقة بجودة عسل الهيثم؟",
    answer: (
      <>
        ثقتنا لا تأتي من الأوراق فقط، بل من إرثنا الممتد منذ 1997. شهادة عملائنا هي أفضل شهادة جودة لدينا، فنحن نضع اسم عائلتنا ضماناً لكل قطرة.{" "}
        <span className="text-amber-500 font-bold">"فليسأل عنا عملاؤنا"</span> هو الشعار الذي نحمله ونفخر به.
      </>
    )
  },
  {
    question: "هل تبلور العسل يعني أنه فاسد أو مغشوش؟",
    answer: "على العكس تمامًا. تبلور العسل هو ظاهرة طبيعية تحدث للعسل الخام غير المعالج حراريًا، وتدلّ غالبًا على نقائه. يمكنك ببساطة وضع العسل في حمام مائي دافئ (وليس ساخنًا) ليعود لحالته السائلة دون أن يفقد خصائصه."
  },
  {
    question: "كيف يتم شحن المنتجات داخل سوريا؟",
    answer: "نوفر شحناً آمناً وسريعاً لكافة المحافظات السورية لضمان وصول المنتج بحالته الأصلية."
  },
  {
    question: "هل يمكنني طلب خلطة مخصصة لحالتي الصحية؟",
    answer: "بالتأكيد، يمكنك التواصل معنا عبر واتساب لتجهيز خلطة تناسب احتياجاتك الخاصة بخبرة نحّال، وحسب الهدف والحالة الصحية."
  },
  {
    question: "ما هي سياسة الاسترجاع لديكم؟",
    answer: "نحن نثق بمنتجاتنا، لذا نقدم ضمان استرداد الأموال بالكامل إذا لم تكن راضياً عن الجودة."
  },
  {
    question: "هل العسل آمن للأطفال؟",
    answer: (
      <>
        العسل الطبيعي آمن للأطفال فوق عمر <span className="text-white font-bold">السنتين</span>. ولا يُنصح به لمن هم دون ذلك بسبب احتمال وجود بكتيريا غير مناسبة لأمعاء الرضّع (مثل <em className="text-zinc-300">Clostridium botulinum</em>).
      </>
    )
  },
  {
    question: "ما الفرق بين \"العسل الخام\" و\"العسل التجاري\"؟",
    answer: "العسل الخام (Raw Honey) هو العسل الذي لم يتعرض للبسترة أو التصفية المفرطة، ما يعني احتفاظه بإنزيماته الطبيعية، ومركباته الفعالة، وحبوب اللقاح. أما العسل التجاري فغالبًا يُسخّن ويُصفّى بشدة، ما يقلل من قيمته الغذائية."
  },
  {
    question: "هل يمكن استخدام العسل بدل السكر؟",
    answer: "نعم، العسل الطبيعي بديل صحي ومغذٍّ للسكر الأبيض، ويمتاز بمؤشر سكّري أقل ومضادات أكسدة أعلى. لكن لمرضى السكري، ننصح بالاعتدال واستشارة الطبيب."
  },
  {
    question: "ما أفضل طريقة لتناول العسل صباحًا؟",
    answer: "أفضل طريقة: ملعقة صغيرة ممزوجة بكوب ماء فاتر، على الريق صباحًا. طريقة فعالة لتعزيز الامتصاص وتحفيز الجهاز الهضمي، وهي ما ورد في السنّة النبوية."
  },
  {
    question: "هل يمكنني استخدام ملاعق معدنية مع العسل؟",
    answer: "نعم. لا يوجد دليل علمي على تفاعل ضار بين العسل والملاعق المعدنية. الأهم هو النظافة والجفاف. يمكنك استخدام ملعقة خشبية، بلاستيكية أو معدنية دون قلق."
  },
  {
    question: "هل تقدّمون شهادة جودة للعسل؟",
    answer: "نحن نضمن جودة عسلنا بتتبّع مصدره من الخلية إلى العبوة، لكن لا نعتمد على الشهادات التسويقية الجاهزة. ثقتك نكسبها بالشفافية، لا بالورق."
  },
  {
    question: "هل منتجاتكم متوفرة خارج سوريا؟",
    answer: "حاليًا، التوصيل متاح داخل الأراضي السورية فقط. نعمل على دراسة التوسع الإقليمي قريبًا بإذن الله."
  },
  {
    question: "كيف أحفظ العسل بعد فتح العبوة؟",
    answer: (
      <ul className="list-disc list-inside space-y-2 text-zinc-400 marker:text-amber-500">
        <li>في مكان جاف، بعيد عن الضوء والرطوبة.</li>
        <li>درجة حرارة الغرفة (20-25°) مثالية.</li>
        <li>لا تضعه في الثلاجة، ولا تتركه مكشوفًا.</li>
      </ul>
    )
  }
];

interface FAQProps {
  limit?: number;
}

export const FAQ: React.FC<FAQProps> = ({ limit }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const displayedFAQ = limit ? faqData.slice(0, limit) : faqData;

  return (
    <section className="py-16 px-4 bg-zinc-950">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-amiri font-bold text-white mb-4">
            الأسئلة الشائعة
          </h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full mb-6"></div>
          <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed text-lg">
            كل ما تحتاج معرفته عن العسل الطبيعي ومنتجات النحل — <span className="text-amber-500">بثقة، ووعي، ومسؤولية.</span>
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {displayedFAQ.map((item, index) => (
            <div 
              key={index} 
              className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30"
            >
              <button
                onClick={() => toggleIndex(index)}
                className="w-full flex items-center justify-between p-5 text-right hover:bg-zinc-900/50 transition-colors focus:outline-none min-h-[60px]"
                aria-expanded={activeIndex === index}
              >
                <span className="font-bold text-zinc-100 text-lg">{item.question}</span>
                <ChevronDown 
                  className={`w-6 h-6 text-amber-500 transition-transform duration-300 flex-shrink-0 ${
                    activeIndex === index ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-5 pt-0 text-zinc-400 leading-relaxed border-t border-zinc-800/50">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {limit && (
          <div className="text-center">
            <Link 
              to="/faq" 
              className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-bold transition-colors"
            >
              عرض كل الأسئلة
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
