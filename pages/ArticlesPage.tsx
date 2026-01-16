import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Heart, ShieldCheck, Sparkles } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  keywords: string[];
  image?: string;
}

const articles: Article[] = [
  {
    id: 'black-seed-honey-benefits',
    title: 'فوائد عسل حبة البركة الصحية',
    description: 'اكتشف الفوائد الصحية المذهلة لعسل حبة البركة وكيف يمكنه دعم مناعتك وصحتك العامة.',
    keywords: ['عسل حبة البركة', 'فوائد العسل', 'دعم المناعة', 'عسل طبيعي'],
    content: `
      <h2>ما هو عسل حبة البركة؟</h2>
      <p>عسل حبة البركة هو مزيج طبيعي من العسل النقي مع مستخلصات حبة البركة (الحبة السوداء)، وهو من أكثر أنواع العسل فائدة صحياً.</p>
      
      <h2>الفوائد الصحية الرئيسية</h2>
      <ul>
        <li><strong>تقوية الجهاز المناعي:</strong> يحتوي على مضادات أكسدة قوية تساعد في محاربة الأمراض</li>
        <li><strong>مضاد للالتهابات:</strong> يساعد في تقليل الالتهابات في الجسم</li>
        <li><strong>تحسين صحة الجهاز التنفسي:</strong> فعال في علاج السعال والتهاب الحلق</li>
        <li><strong>دعم صحة القلب:</strong> يساعد في تحسين صحة القلب والأوعية الدموية</li>
      </ul>
      
      <h2>كيفية الاستخدام</h2>
      <p>يُنصح بتناول ملعقة كبيرة من عسل حبة البركة صباحاً على الريق أو قبل النوم. يمكن أيضاً مزجه مع الماء الدافئ والليمون للحصول على فوائد إضافية.</p>
    `
  },
  {
    id: 'how-to-identify-natural-honey',
    title: 'كيف تميّز العسل الطبيعي من المغشوش؟',
    description: 'دليل شامل لتمييز العسل الطبيعي الأصيل من العسل المغشوش، مع نصائح عملية من خبراء الهيثم.',
    keywords: ['تمييز العسل', 'عسل طبيعي', 'كشف غش العسل', 'جودة العسل'],
    content: `
      <h2>علامات العسل الطبيعي الأصيل</h2>
      <ul>
        <li><strong>التبلور:</strong> العسل الطبيعي يتبلور مع الوقت، خاصة في الطقس البارد</li>
        <li><strong>اللزوجة:</strong> العسل الطبيعي له لزوجة عالية ولا ينسكب بسهولة</li>
        <li><strong>الرائحة:</strong> رائحة زهرية طبيعية مميزة</li>
        <li><strong>الطعم:</strong> طعم حلو مع لمسة حموضة خفيفة</li>
      </ul>
      
      <h2>اختبارات بسيطة</h2>
      <p><strong>اختبار الماء:</strong> ضع قطرات من العسل في كوب ماء. العسل الطبيعي يغوص للقاع، بينما المغشوش يذوب بسرعة.</p>
      <p><strong>اختبار الورق:</strong> ضع قطرات من العسل على ورق. العسل الطبيعي لا يترك بقعاً مائية.</p>
      
      <h2>لماذا اختيار عسل الهيثم؟</h2>
      <p>جميع منتجاتنا مفحوصة مخبرياً وموثقة بضمان الجودة. نحن نضمن لك 100% عسل طبيعي من مراعي سوريا.</p>
    `
  },
  {
    id: 'honey-crystallization',
    title: 'هل تبلور العسل دليل على الغش؟',
    description: 'تعرف على حقيقة تبلور العسل ولماذا يعتبر علامة على الجودة والنقاء، وليس الغش.',
    keywords: ['تبلور العسل', 'عسل متبلور', 'جودة العسل', 'عسل طبيعي'],
    content: `
      <h2>ما هو تبلور العسل؟</h2>
      <p>التبلور هو عملية طبيعية تحدث للعسل النقي عندما يتحول من الحالة السائلة إلى الحالة الصلبة. هذا يحدث بسبب السكريات الطبيعية في العسل.</p>
      
      <h2>لماذا يتبلور العسل؟</h2>
      <ul>
        <li>العسل الطبيعي يحتوي على نسبة عالية من الجلوكوز الذي يتبلور بسهولة</li>
        <li>التبلور يحدث بشكل أسرع في درجات الحرارة المنخفضة</li>
        <li>بعض أنواع العسل تتبلور أسرع من غيرها حسب مصدر الرحيق</li>
      </ul>
      
      <h2>التبلور = علامة جودة</h2>
      <p>على عكس الاعتقاد الشائع، التبلور هو علامة إيجابية على أن العسل طبيعي ونقي. العسل المغشوش بالسكر الصناعي لا يتبلور بنفس الطريقة.</p>
      
      <h2>كيفية إعادة العسل المتبلور للحالة السائلة</h2>
      <p>ضع العسل في حمام مائي دافئ (لا يزيد عن 40 درجة مئوية) وحركه برفق. تجنب تسخينه مباشرة على النار لأنه يفقد خصائصه الصحية.</p>
    `
  },
  {
    id: 'honey-for-children-cough',
    title: 'أفضل عسل للسعال عند الأطفال',
    description: 'دليل شامل لاستخدام العسل الطبيعي في علاج السعال عند الأطفال، مع نصائح آمنة من خبراء الصحة.',
    keywords: ['عسل للأطفال', 'علاج السعال', 'عسل طبيعي', 'صحة الأطفال'],
    content: `
      <h2>لماذا العسل فعال للسعال؟</h2>
      <p>العسل الطبيعي يحتوي على خصائص مضادة للبكتيريا والالتهابات، مما يجعله فعالاً في تهدئة السعال والتهاب الحلق.</p>
      
      <h2>أنواع العسل المناسبة للأطفال</h2>
      <ul>
        <li><strong>عسل الدردار:</strong> ممتاز لتهدئة السعال والتهاب الحلق</li>
        <li><strong>عسل الجيجان:</strong> مناسب للأطفال كغذاء صحي عام</li>
        <li><strong>عسل حبة البركة:</strong> يقوي المناعة ويساعد في مقاومة الأمراض</li>
      </ul>
      
      <h2>تحذيرات مهمة</h2>
      <p><strong>⚠️ مهم جداً:</strong> لا تعطي العسل للأطفال دون السنة من العمر بسبب خطر التسمم الغذائي (Botulism).</p>
      
      <h2>الجرعة المناسبة</h2>
      <p>للأطفال من سنة إلى 3 سنوات: نصف ملعقة صغيرة يومياً</p>
      <p>للأطفال من 3 سنوات فما فوق: ملعقة صغيرة إلى ملعقة كبيرة يومياً</p>
      
      <h2>طريقة الاستخدام</h2>
      <p>يمكن إعطاء العسل مباشرة أو مزجه مع الماء الدافئ والليمون. يُفضل تناوله قبل النوم لتهدئة السعال الليلي.</p>
    `
  }
];

export const ArticlesPage: React.FC = () => {
  const phoneNumber = "963930112994";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-32">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-amber-500" />
            <span className="text-amber-500 font-bold tracking-[0.4em] uppercase text-xs italic">
              Articles & Guides
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-amiri font-bold mb-6 text-white">
            مقالات ومرشدات العسل
          </h1>
          <p className="text-zinc-400 text-xl font-light max-w-2xl mx-auto">
            اكتشف فوائد العسل الطبيعي وكل ما تحتاج معرفته عن منتجات النحل
          </p>
        </motion.div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {articles.map((article, idx) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-zinc-900/40 rounded-2xl p-6 border border-white/5 hover:border-amber-500/30 transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <h2 className="text-xl font-amiri font-bold text-white group-hover:text-amber-400 transition-colors">
                  {article.title}
                </h2>
              </div>
              <p className="text-zinc-400 mb-6 leading-relaxed">
                {article.description}
              </p>
              <Link
                to={`/articles/${article.id}`}
                className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors font-bold"
              >
                اقرأ المزيد
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-br from-amber-500/10 to-transparent p-12 rounded-2xl border border-amber-500/20"
        >
          <h2 className="text-3xl font-amiri font-bold text-white mb-4">
            جاهز لتجربة عسلنا الطبيعي؟
          </h2>
          <p className="text-zinc-400 mb-8 text-lg">
            اطلب الآن واحصل على عسل طبيعي 100% مفحوص مخبرياً
          </p>
          <a
            href={`https://wa.me/${phoneNumber}?text=أريد طلب عسل طبيعي`}
            className="inline-flex items-center gap-3 px-10 py-5 bg-amber-500 text-zinc-950 rounded-full font-black hover:bg-amber-400 transition-all duration-300 hover:scale-105 text-xl"
          >
            🍯 اطلب الآن عبر واتساب
          </a>
        </motion.div>
      </div>
    </div>
  );
};
