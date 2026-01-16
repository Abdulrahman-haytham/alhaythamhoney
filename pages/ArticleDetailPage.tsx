import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, ShoppingCart } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  keywords: string[];
  image?: string;
}

const articles: Record<string, Article> = {
  'black-seed-honey-benefits': {
    id: 'black-seed-honey-benefits',
    title: 'فوائد عسل حبة البركة الصحية',
    description: 'اكتشف الفوائد الصحية المذهلة لعسل حبة البركة وكيف يمكنه دعم مناعتك وصحتك العامة.',
    keywords: ['عسل حبة البركة', 'فوائد العسل', 'دعم المناعة', 'عسل طبيعي'],
    content: `
      <h2>ما هو عسل حبة البركة؟</h2>
      <p>عسل حبة البركة هو مزيج طبيعي من العسل النقي مع مستخلصات حبة البركة (الحبة السوداء)، وهو من أكثر أنواع العسل فائدة صحياً. يتميز بخصائص علاجية قوية تجعله خياراً مثالياً لدعم الصحة العامة.</p>
      
      <h2>الفوائد الصحية الرئيسية</h2>
      <ul>
        <li><strong>تقوية الجهاز المناعي:</strong> يحتوي على مضادات أكسدة قوية تساعد في محاربة الأمراض والعدوى. عسل حبة البركة يعزز إنتاج الخلايا المناعية في الجسم.</li>
        <li><strong>مضاد للالتهابات:</strong> يساعد في تقليل الالتهابات في الجسم بفضل خصائص حبة البركة المضادة للالتهابات.</li>
        <li><strong>تحسين صحة الجهاز التنفسي:</strong> فعال في علاج السعال والتهاب الحلق والربو. يساعد في تهدئة الشعب الهوائية.</li>
        <li><strong>دعم صحة القلب:</strong> يساعد في تحسين صحة القلب والأوعية الدموية من خلال خفض ضغط الدم والكوليسترول.</li>
        <li><strong>مضاد للبكتيريا والفطريات:</strong> يحتوي على خصائص مضادة للميكروبات تحمي من العدوى.</li>
      </ul>
      
      <h2>كيفية الاستخدام</h2>
      <p>يُنصح بتناول ملعقة كبيرة من عسل حبة البركة صباحاً على الريق أو قبل النوم. يمكن أيضاً مزجه مع الماء الدافئ والليمون للحصول على فوائد إضافية. للاستخدام العلاجي، يمكن تناول ملعقتين يومياً.</p>
      
      <h2>من أين تحصل على عسل حبة البركة الأصيل؟</h2>
      <p>في الهيثم لنحل وعسل، نقدم لك عسل حبة البركة الطبيعي 100% مفحوص مخبرياً. جميع منتجاتنا تأتي من مراعي سوريا الطبيعية وتخضع لفحص دقيق لضمان الجودة والنقاء.</p>
    `
  },
  'how-to-identify-natural-honey': {
    id: 'how-to-identify-natural-honey',
    title: 'كيف تميّز العسل الطبيعي من المغشوش؟',
    description: 'دليل شامل لتمييز العسل الطبيعي الأصيل من العسل المغشوش، مع نصائح عملية من خبراء الهيثم.',
    keywords: ['تمييز العسل', 'عسل طبيعي', 'كشف غش العسل', 'جودة العسل'],
    content: `
      <h2>علامات العسل الطبيعي الأصيل</h2>
      <ul>
        <li><strong>التبلور:</strong> العسل الطبيعي يتبلور مع الوقت، خاصة في الطقس البارد. هذا علامة إيجابية على النقاء.</li>
        <li><strong>اللزوجة:</strong> العسل الطبيعي له لزوجة عالية ولا ينسكب بسهولة. عند سكبه، يتدفق بشكل خيطي مستمر.</li>
        <li><strong>الرائحة:</strong> رائحة زهرية طبيعية مميزة تختلف حسب نوع الزهور. العسل المغشوش قد لا يكون له رائحة أو له رائحة صناعية.</li>
        <li><strong>الطعم:</strong> طعم حلو مع لمسة حموضة خفيفة. يترك إحساساً لاذعاً خفيفاً في الحلق.</li>
        <li><strong>الملمس:</strong> عند فركه بين الأصابع، العسل الطبيعي يمتص بسهولة في الجلد، بينما المغشوش يترك حبيبات سكر.</li>
      </ul>
      
      <h2>اختبارات بسيطة</h2>
      <p><strong>اختبار الماء:</strong> ضع قطرات من العسل في كوب ماء. العسل الطبيعي يغوص للقاع ويبقى متماسكاً، بينما المغشوش يذوب بسرعة ويختلط بالماء.</p>
      <p><strong>اختبار الورق:</strong> ضع قطرات من العسل على ورق. العسل الطبيعي لا يترك بقعاً مائية ولا ينسكب بسهولة.</p>
      <p><strong>اختبار الإبهام:</strong> ضع قطرة من العسل على إبهامك. العسل الطبيعي يبقى متماسكاً ولا ينتشر بسهولة.</p>
      
      <h2>لماذا اختيار عسل الهيثم؟</h2>
      <p>جميع منتجاتنا مفحوصة مخبرياً وموثقة بضمان الجودة. نحن نضمن لك 100% عسل طبيعي من مراعي سوريا. كل منتج يأتي مع شهادة فحص مخبري تؤكد النقاء والجودة.</p>
    `
  },
  'honey-crystallization': {
    id: 'honey-crystallization',
    title: 'هل تبلور العسل دليل على الغش؟',
    description: 'تعرف على حقيقة تبلور العسل ولماذا يعتبر علامة على الجودة والنقاء، وليس الغش.',
    keywords: ['تبلور العسل', 'عسل متبلور', 'جودة العسل', 'عسل طبيعي'],
    content: `
      <h2>ما هو تبلور العسل؟</h2>
      <p>التبلور هو عملية طبيعية تحدث للعسل النقي عندما يتحول من الحالة السائلة إلى الحالة الصلبة. هذا يحدث بسبب السكريات الطبيعية في العسل، خاصة الجلوكوز الذي يتبلور بسهولة.</p>
      
      <h2>لماذا يتبلور العسل؟</h2>
      <ul>
        <li>العسل الطبيعي يحتوي على نسبة عالية من الجلوكوز الذي يتبلور بسهولة</li>
        <li>التبلور يحدث بشكل أسرع في درجات الحرارة المنخفضة (أقل من 14 درجة مئوية)</li>
        <li>بعض أنواع العسل تتبلور أسرع من غيرها حسب مصدر الرحيق</li>
        <li>الرطوبة المنخفضة تسرع عملية التبلور</li>
      </ul>
      
      <h2>التبلور = علامة جودة</h2>
      <p>على عكس الاعتقاد الشائع، التبلور هو علامة إيجابية على أن العسل طبيعي ونقي. العسل المغشوش بالسكر الصناعي لا يتبلور بنفس الطريقة الطبيعية. التبلور يثبت أن العسل لم يتم تسخينه أو معالجته بشكل مفرط.</p>
      
      <h2>كيفية إعادة العسل المتبلور للحالة السائلة</h2>
      <p>ضع العسل في حمام مائي دافئ (لا يزيد عن 40 درجة مئوية) وحركه برفق. تجنب تسخينه مباشرة على النار أو في الميكروويف لأنه يفقد خصائصه الصحية والإنزيمات الطبيعية. يمكن أيضاً وضعه في مكان دافئ في المنزل.</p>
      
      <h2>هل يؤثر التبلور على الفوائد الصحية؟</h2>
      <p>لا، التبلور لا يؤثر على الفوائد الصحية للعسل. جميع الخصائص العلاجية والإنزيمات تبقى سليمة. يمكنك تناول العسل المتبلور مباشرة أو إعادة تسييله حسب تفضيلك.</p>
    `
  },
  'honey-for-children-cough': {
    id: 'honey-for-children-cough',
    title: 'أفضل عسل للسعال عند الأطفال',
    description: 'دليل شامل لاستخدام العسل الطبيعي في علاج السعال عند الأطفال، مع نصائح آمنة من خبراء الصحة.',
    keywords: ['عسل للأطفال', 'علاج السعال', 'عسل طبيعي', 'صحة الأطفال'],
    content: `
      <h2>لماذا العسل فعال للسعال؟</h2>
      <p>العسل الطبيعي يحتوي على خصائص مضادة للبكتيريا والالتهابات، مما يجعله فعالاً في تهدئة السعال والتهاب الحلق. الدراسات العلمية أثبتت أن العسل قد يكون أكثر فعالية من بعض أدوية السعال التقليدية.</p>
      
      <h2>أنواع العسل المناسبة للأطفال</h2>
      <ul>
        <li><strong>عسل الدردار:</strong> ممتاز لتهدئة السعال والتهاب الحلق. يساعد في تهدئة الشعب الهوائية.</li>
        <li><strong>عسل الجيجان:</strong> مناسب للأطفال كغذاء صحي عام. غني بالفيتامينات والمعادن.</li>
        <li><strong>عسل حبة البركة:</strong> يقوي المناعة ويساعد في مقاومة الأمراض. مناسب للأطفال الأكبر سناً.</li>
      </ul>
      
      <h2>تحذيرات مهمة</h2>
      <p><strong>⚠️ مهم جداً:</strong> لا تعطي العسل للأطفال دون السنة من العمر بسبب خطر التسمم الغذائي (Botulism). البكتيريا الموجودة في العسل قد تكون خطيرة على الأطفال الرضع.</p>
      
      <h2>الجرعة المناسبة</h2>
      <p><strong>للأطفال من سنة إلى 3 سنوات:</strong> نصف ملعقة صغيرة يومياً (2.5-5 جرام)</p>
      <p><strong>للأطفال من 3 سنوات فما فوق:</strong> ملعقة صغيرة إلى ملعقة كبيرة يومياً (5-15 جرام)</p>
      <p><strong>للسعال الحاد:</strong> يمكن إعطاء ملعقة صغيرة قبل النوم مباشرة</p>
      
      <h2>طريقة الاستخدام</h2>
      <p>يمكن إعطاء العسل مباشرة أو مزجه مع الماء الدافئ والليمون. يُفضل تناوله قبل النوم لتهدئة السعال الليلي. يمكن أيضاً مزجه مع الحليب الدافئ أو الشاي الخفيف.</p>
      
      <h2>متى يجب استشارة الطبيب؟</h2>
      <p>إذا استمر السعال لأكثر من أسبوع، أو كان مصحوباً بحمى أو صعوبة في التنفس، يجب استشارة الطبيب فوراً. العسل علاج مساعد وليس بديلاً عن الرعاية الطبية عند الحاجة.</p>
    `
  }
};

export const ArticleDetailPage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const article = articleId ? articles[articleId] : null;
  const phoneNumber = "963930112994";

  if (!article) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <Header />
        <div className="pt-32 pb-16">
          <div className="container mx-auto px-6 py-12 text-center">
            <h1 className="text-4xl font-bold mb-4">المقال غير موجود</h1>
            <Link to="/articles" className="text-amber-500 hover:text-amber-400">
              العودة إلى المقالات
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-400">
            <Link to="/" className="hover:text-amber-500 transition-colors">الرئيسية</Link>
            <span>/</span>
            <Link to="/articles" className="hover:text-amber-500 transition-colors">المقالات</Link>
            <span>/</span>
            <span className="text-amber-500">{article.title}</span>
          </nav>

          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <span className="text-amber-500 font-bold tracking-wider uppercase text-xs">
                Article
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-amiri font-bold text-white mb-6">
              {article.title}
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed mb-6">
              {article.description}
            </p>
          </motion.div>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert prose-lg max-w-none"
          >
            <div 
              className="text-zinc-300 leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: article.content }}
              style={{
                lineHeight: '1.8'
              }}
            />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center bg-gradient-to-br from-amber-500/10 to-transparent p-12 rounded-2xl border border-amber-500/20"
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
              <ShoppingCart className="w-6 h-6" />
              🍯 اطلب الآن عبر واتساب
            </a>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
