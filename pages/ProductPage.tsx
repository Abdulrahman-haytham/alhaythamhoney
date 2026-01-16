import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingCart, CheckCircle2, Leaf, Heart, Zap } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface ProductData {
  id: string;
  name: string;
  nameEn: string;
  desc: string;
  image: string;
  badge?: string;
  benefit?: string;
  detailedInfo?: {
    uses?: string[];
    benefits?: string[];
    properties?: string[];
    howToUse?: string;
  };
  faq?: { question: string; answer: string }[];
}

const products: Record<string, ProductData> = {
  'black-seed-honey': {
    id: 'black-seed-honey',
    name: 'عسل حبة البركة',
    nameEn: 'Black Seed Honey',
    desc: 'القوة السوداء والشفاء العريق، مستخلص لضمان أعلى الفوائد المناعية.',
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=800',
    badge: 'الأكثر طلباً',
    benefit: 'دعم المناعة',
    detailedInfo: {
      benefits: [
        'تقوية الجهاز المناعي ومقاومة الأمراض',
        'مضاد للالتهابات والبكتيريا',
        'تحسين صحة الجهاز التنفسي',
        'دعم صحة القلب والأوعية الدموية',
        'مضاد للأكسدة يحمي الخلايا'
      ],
      uses: [
        'تناول ملعقة صباحاً على الريق',
        'مزجه مع الماء الدافئ والليمون',
        'استخدامه كبديل طبيعي للسكر',
        'تطبيقه موضعياً على الجروح'
      ],
      properties: [
        '100% عسل صافي طبيعي',
        'مستخلص من حبة البركة الأصيلة',
        'خالي من المواد الحافظة',
        'مختبر ومُختبر جودة'
      ],
      howToUse: 'تناول ملعقة كبيرة (15-20 جرام) صباحاً على الريق أو قبل النوم. يمكن مزجه مع الماء الدافئ أو تناوله مباشرة. يُنصح بعدم تسخينه لدرجة عالية للحفاظ على خصائصه.'
    },
    faq: [
      {
        question: 'ما هي فوائد عسل حبة البركة؟',
        answer: 'عسل حبة البركة يساعد في تقوية المناعة، مقاومة الالتهابات، وتحسين صحة الجهاز التنفسي والقلب.'
      },
      {
        question: 'كيف أتأكد من جودة العسل؟',
        answer: 'عسلنا مفحوص مخبرياً وموثق بضمان الجودة. يمكنك طلب شهادة الفحص مع كل طلب.'
      },
      {
        question: 'هل يمكن للأطفال تناول عسل حبة البركة؟',
        answer: 'نعم، لكن يُنصح بعدم إعطائه للأطفال دون السنة. للأطفال الأكبر سناً، ملعقة صغيرة يومياً.'
      }
    ]
  },
  'dardar-honey': {
    id: 'dardar-honey',
    name: 'عسل الدردار',
    nameEn: 'Dardar Honey',
    desc: 'طعم الطبيعة السورية الأصيل، رحيق نادر يجسد عراقة الأرض.',
    image: 'https://res.cloudinary.com/dkbvnupge/image/upload/v1768245563/my-app-uploads/bdtoimsuk9sjkirvpvbw.jpg',
    benefit: 'طاقة وتنفس',
    detailedInfo: {
      benefits: [
        'تحسين وظائف الجهاز التنفسي',
        'مقاومة السعال والتهاب الحلق',
        'مصدر طبيعي للطاقة السريعة',
        'دعم صحة الجهاز الهضمي',
        'تعزيز النشاط البدني'
      ],
      uses: [
        'علاج طبيعي للسعال والبرد',
        'مصدر طاقة قبل التمارين',
        'تحلية المشروبات الساخنة',
        'تناول يومي للصحة العامة'
      ],
      properties: [
        'عسل نادر من أشجار الدردار',
        'نكهة مميزة وعميقة',
        'مستخرج من مراعي سورية',
        'طبيعي 100%'
      ],
      howToUse: 'ملعقة كبيرة يومياً، خاصة في فصل الشتاء أو عند الشعور بالإرهاق. يمكن تناوله مع الشاي أو الماء الدافئ لتهدئة الحلق.'
    },
    faq: [
      {
        question: 'ما الذي يميز عسل الدردار؟',
        answer: 'عسل الدردار نادر ويتميز بنكهة عميقة وفريدة. يساعد بشكل خاص في تحسين صحة الجهاز التنفسي.'
      },
      {
        question: 'هل عسل الدردار مناسب للسعال؟',
        answer: 'نعم، عسل الدردار فعال جداً في علاج السعال والتهاب الحلق بشكل طبيعي.'
      }
    ]
  },
  'jeejan-honey': {
    id: 'jeejan-honey',
    name: 'عسل الجيجان',
    nameEn: 'Jeejan Honey',
    desc: 'نكهة برية فريدة لا تُنسى، يجمع من أزهار الجيجان البرية في البادية.',
    image: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&q=80&w=800',
    benefit: 'تغذية عامة',
    detailedInfo: {
      benefits: [
        'تغذية شاملة للجسم',
        'مصدر غني بالفيتامينات والمعادن',
        'تحسين الهضم والامتصاص',
        'دعم النمو والتطور',
        'تعزيز الطاقة والحيوية'
      ],
      uses: [
        'تغذية يومية متكاملة',
        'للأطفال والكبار',
        'مصدر طبيعي للكربوهيدرات',
        'دعم النظام الغذائي الصحي'
      ],
      properties: [
        'عسل بري من البادية',
        'نكهة قوية ومميزة',
        'غني بالإنزيمات الطبيعية',
        'مستخرج من أزهار الجيجان النادرة'
      ],
      howToUse: 'ملعقة إلى ملعقتين يومياً كجزء من نظام غذائي متوازن. مناسب للاستخدام اليومي ولجميع أفراد العائلة.'
    }
  },
  'propolis': {
    id: 'propolis',
    name: 'العكبر (Propolis)',
    nameEn: 'Propolis',
    desc: 'درع حماية فائق لمناعتك من قلب الخلية.',
    image: 'https://res.cloudinary.com/dkbvnupge/image/upload/v1768245473/my-app-uploads/ynkkzbdxrtsfvptrclle.jpg',
    benefit: 'مضاد حيوي طبيعي',
    detailedInfo: {
      benefits: [
        'مضاد حيوي طبيعي قوي',
        'تقوية الجهاز المناعي',
        'مقاومة الالتهابات والفيروسات',
        'شفاء الجروح والحروق',
        'دعم صحة الفم والأسنان'
      ],
      uses: [
        'مضغ قطعة صغيرة يومياً',
        'استخدامه كغرغرة للفم',
        'تطبيقه موضعياً على الجروح',
        'مكمل غذائي للوقاية'
      ],
      properties: [
        'مستخرج من خلايا النحل',
        'غني بالفلافونويدات',
        'مضاد أكسدة قوي',
        'طبيعي 100%'
      ],
      howToUse: 'يمكن مضغ قطعة صغيرة (حجم حبة البازلاء) يومياً، أو استخدامه كغرغرة بعد إذابته في الماء. للاستخدام الموضعي، يُطبق مباشرة على المنطقة المصابة.'
    }
  },
  'royal-jelly': {
    id: 'royal-jelly',
    name: 'غذاء ملكات النحل',
    nameEn: 'Royal Jelly',
    desc: 'منبع الحيوية والنشاط الدائم، مركز طاقة نقي.',
    image: 'https://res.cloudinary.com/dkbvnupge/image/upload/v1768244891/my-app-uploads/hydwzteebguygp6fg3ak.jpg',
    badge: 'ملك الخلية',
    benefit: 'إصدار فاخر',
    detailedInfo: {
      benefits: [
        'تعزيز الطاقة والحيوية',
        'تحسين الذاكرة والتركيز',
        'دعم صحة الجلد والشعر',
        'تقوية المناعة',
        'مضاد للشيخوخة'
      ],
      uses: [
        'تناول يومي للطاقة',
        'دعم الأداء الرياضي',
        'تحسين المزاج والحيوية',
        'دعم صحة المرأة'
      ],
      properties: [
        'غذاء الملكات النقي',
        'غني بالبروتينات والفيتامينات',
        'مستخرج طازج من الخلية',
        'منتج فاخر عالي الجودة'
      ],
      howToUse: 'تناول 1-2 جرام يومياً على الريق (حوالي نصف ملعقة صغيرة). يُنصح بوضعه تحت اللسان لمدة دقيقة قبل البلع لامتصاص أفضل. يُحفظ في الثلاجة.'
    }
  }
};

export const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const product = productId ? products[productId] : null;
  const phoneNumber = "963930112994";

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-32">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">المنتج غير موجود</h1>
          <Link to="/" className="text-amber-500 hover:text-amber-400">
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-400">
            <Link to="/" className="hover:text-amber-500 transition-colors">الرئيسية</Link>
            <span>/</span>
            <Link to="/store" className="hover:text-amber-500 transition-colors">المتجر</Link>
            <span>/</span>
            <span className="text-amber-500">{product.name}</span>
          </nav>

          {/* Product Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={product.image}
                alt={`${product.name} - عسل طبيعي 100% من الهيثم لنحل وعسل`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <div className="absolute top-6 right-6 bg-amber-500 text-zinc-950 text-sm font-black px-4 py-2 rounded-full uppercase">
                  {product.badge}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-amiri font-bold text-white mb-4">
                {product.name}
              </h1>
              {product.benefit && (
                <span className="inline-block text-sm bg-amber-500/10 text-amber-500 px-4 py-2 rounded-lg font-bold uppercase mb-6 border border-amber-500/20">
                  {product.benefit}
                </span>
              )}
              <p className="text-zinc-300 text-lg mb-8 leading-relaxed">
                {product.desc}
              </p>
              <a
                href={`https://wa.me/${phoneNumber}?text=أريد طلب ${product.name}`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-amber-500 text-zinc-950 rounded-full font-bold hover:bg-amber-400 transition-all duration-300 hover:scale-105 text-lg"
              >
                <ShoppingCart className="w-6 h-6" />
                🍯 اطلب الآن عبر واتساب
              </a>
            </div>
          </motion.div>

          {/* Detailed Information */}
          {product.detailedInfo && (
            <div className="space-y-12 mb-16">
              {product.detailedInfo.benefits && (
                <section>
                  <h2 className="text-3xl font-amiri font-bold text-white mb-6 flex items-center gap-3">
                    <Heart className="w-8 h-8 text-amber-500" />
                    الفوائد الصحية
                  </h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.detailedInfo.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-zinc-900/50 p-4 rounded-xl">
                        <CheckCircle2 className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {product.detailedInfo.uses && (
                <section>
                  <h2 className="text-3xl font-amiri font-bold text-white mb-6 flex items-center gap-3">
                    <Leaf className="w-8 h-8 text-amber-500" />
                    الاستخدامات
                  </h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.detailedInfo.uses.map((use, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-zinc-900/50 p-4 rounded-xl">
                        <Zap className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-300">{use}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {product.detailedInfo.properties && (
                <section>
                  <h2 className="text-3xl font-amiri font-bold text-white mb-6">الخصائص</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.detailedInfo.properties.map((property, idx) => (
                      <div key={idx} className="bg-zinc-900/50 p-4 rounded-xl border-r-4 border-amber-500">
                        <p className="text-zinc-300">{property}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {product.detailedInfo.howToUse && (
                <section className="bg-zinc-900/50 p-8 rounded-2xl border border-amber-500/20">
                  <h2 className="text-3xl font-amiri font-bold text-white mb-4">طريقة الاستخدام</h2>
                  <p className="text-zinc-300 text-lg leading-relaxed">{product.detailedInfo.howToUse}</p>
                </section>
              )}
            </div>
          )}

          {/* FAQ */}
          {product.faq && product.faq.length > 0 && (
            <section className="mb-16">
              <h2 className="text-3xl font-amiri font-bold text-white mb-8">أسئلة شائعة</h2>
              <div className="space-y-4">
                {product.faq.map((item, idx) => (
                  <div key={idx} className="bg-zinc-900/50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-3">{item.question}</h3>
                    <p className="text-zinc-300 leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="text-center bg-gradient-to-br from-amber-500/10 to-transparent p-12 rounded-2xl border border-amber-500/20">
            <h2 className="text-3xl font-amiri font-bold text-white mb-4">
              جاهز لتجربة {product.name}؟
            </h2>
            <p className="text-zinc-400 mb-8 text-lg">
              اطلب الآن واحصل على عسل طبيعي 100% مفحوص مخبرياً
            </p>
            <a
              href={`https://wa.me/${phoneNumber}?text=أريد طلب ${product.name}`}
              className="inline-flex items-center gap-3 px-10 py-5 bg-amber-500 text-zinc-950 rounded-full font-black hover:bg-amber-400 transition-all duration-300 hover:scale-105 text-xl"
            >
              <ShoppingCart className="w-6 h-6" />
              🍯 اطلب الآن عبر واتساب
            </a>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};
