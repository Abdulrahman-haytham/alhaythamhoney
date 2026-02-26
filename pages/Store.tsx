import React, { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Sparkles, Droplets, Eye, ArrowRight } from 'lucide-react';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getWhatsAppLink } from '../config/site';

interface ProductItem {
  name: string;
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
}

interface ProductGroup {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  items: ProductItem[];
  layout: 'grid' | 'lab';
}

const groups: ProductGroup[] = [
  {
    id: "core-honey",
    title: "كنوز النحل – عسل صافي من مراعي مختارة",
    subtitle: "نبدأ بما هو مألوف لنصل إلى أعماق النقاء",
    icon: <Droplets className="w-6 h-6 text-amber-500" />,
    layout: 'grid',
    items: [
      {
        name: "عسل حبة البركة",
        benefit: "دعم المناعة",
        desc: "القوة السوداء والشفاء العريق، مستخلص لضمان أعلى الفوائد المناعية.",
        image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=800&fm=webp",
        badge: "الأكثر طلباً",
        detailedInfo: {
          benefits: [
            "تقوية الجهاز المناعي ومقاومة الأمراض",
            "مضاد للالتهابات والبكتيريا",
            "تحسين صحة الجهاز التنفسي",
            "دعم صحة القلب والأوعية الدموية",
            "مضاد للأكسدة يحمي الخلايا"
          ],
          uses: [
            "تناول ملعقة صباحاً على الريق",
            "مزجه مع الماء الدافئ والليمون",
            "استخدامه كبديل طبيعي للسكر",
            "تطبيقه موضعياً على الجروح"
          ],
          properties: [
            "100% عسل صافي طبيعي",
            " من  زهرة حبة البركة الأصيلة",
            "خالي من المواد الحافظة",
            "مختبر ومُختبر جودة"
          ],
          howToUse: "تناول ملعقة كبيرة (15-20 جرام) صباحاً على الريق أو قبل النوم. يمكن مزجه مع الماء الدافئ أو تناوله مباشرة. يُنصح بعدم تسخينه لدرجة عالية للحفاظ على خصائصه."
        }
      },
      {
        name: "عسل الدردار",
        benefit: "طاقة وتنفس",
        desc: "طعم الطبيعة السورية الأصيل، رحيق نادر يجسد عراقة الأرض.",
        image: "https://res.cloudinary.com/dkbvnupge/image/upload/v1768245563/my-app-uploads/bdtoimsuk9sjkirvpvbw.jpg",
        detailedInfo: {
          benefits: [
            "تحسين وظائف الجهاز التنفسي",
            "مقاومة السعال والتهاب الحلق",
            "مصدر طبيعي للطاقة السريعة",
            "دعم صحة الجهاز الهضمي",
            "تعزيز النشاط البدني"
          ],
          uses: [
            "علاج طبيعي للسعال والبرد",
            "مصدر طاقة قبل التمارين",
            "تحلية المشروبات الساخنة",
            "تناول يومي للصحة العامة"
          ],
          properties: [
            "عسل نادر من ازهار  الدردار",
            "نكهة مميزة وعميقة",
            "مستخرج من مراعي سورية",
            "طبيعي 100%"
          ],
          howToUse: "ملعقة كبيرة يومياً، خاصة في فصل الشتاء أو عند الشعور بالإرهاق. يمكن تناوله مع الشاي أو الماء الدافئ لتهدئة الحلق."
        }
      },
      {
        name: "عسل الجيجان",
        benefit: "تغذية عامة",
        desc: "نكهة برية فريدة لا تُنسى، يجمع من أزهار الجيجان البرية في البادية.",
        image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&q=80&w=800&fm=webp",
        detailedInfo: {
          benefits: [
            "تغذية شاملة للجسم",
            "مصدر غني بالفيتامينات والمعادن",
            "تحسين الهضم والامتصاص",
            "دعم النمو والتطور",
            "تعزيز الطاقة والحيوية"
          ],
          uses: [
            "تغذية يومية متكاملة",
            "للأطفال والكبار",
            "مصدر طبيعي للكربوهيدرات",
            "دعم النظام الغذائي الصحي"
          ],
          properties: [
            "عسل بري من البادية",
            "نكهة قوية ومميزة",
            "غني بالإنزيمات الطبيعية",
            "مستخرج من أزهار الجيجان النادرة"
          ],
          howToUse: "ملعقة إلى ملعقتين يومياً كجزء من نظام غذائي متوازن. مناسب للاستخدام اليومي ولجميع أفراد العائلة."
        }
      }
    ]
  },
 {
  id: "supplements",
  title: "المكملات الحيوية – رفع القيمة",
  subtitle: "خلاصات طبيعية ذكية تدعم الجسد منذ قرون",
  icon: <Sparkles className="w-6 h-6 text-amber-500" />,
  layout: 'grid',
  items: [
    {
      name: "العكبر (Propolis)",
      benefit: "مضاد حيوي طبيعي",
      desc: "درع مناعي ذكي من قلب الخلية – دع مناعتك تعمل بذكاء.",
      image: "https://res.cloudinary.com/dkbvnupge/image/upload/v1768245473/my-app-uploads/ynkkzbdxrtsfvptrclle.jpg",
      detailedInfo: {
        benefits: [
          "مضاد حيوي طبيعي بفعالية مثبتة",
          "يعزز آليات الدفاع المناعي ذاتياً",
          "يكافح الفيروسات والبكتيريا بشكل وقائي",
          "يسرّع شفاء الجروح والحروق",
          "يحمي صحة الفم والأسنان بشكل يومي"
        ],
        uses: [
          "مضغ قطعة صغيرة صباحاً لتعزيز المناعة",
          "تطبيق موضعي على الجروح للحماية والتعقيم",
          "وقاية يومية مستمرة كمكمل غذائي",
          "يمكن خلطه مع العسل لتسهيل تناوله"
        ],
        properties: [
          "يُستخرج بدقة من خلايا النحل",
          "غني بالفلافونويدات المضادة للأكسدة",
          "تركيبة طبيعية فعّالة 100%",
          "لا يسبب مقاومة كالمضادات الاصطناعية"
        ],
        howToUse: "يُستخدم يومياً بمضغ قطعة صغيرة (بحجم حبة البازلاء)، أو يمكن خلطها مع ملعقة صغيرة من العسل لتسهيل الاستعمال. للاستخدام الموضعي يُطبّق مباشرة على الجلد النظيف."
      }
    },
    {
      name: "غذاء ملكات النحل",
      benefit: "التركيبة الملكية للطاقة والتجدد",
      desc: "جوهر النقاء الحيوي – طاقة مركزة تجددك من الداخل.",
      image: "https://res.cloudinary.com/dkbvnupge/image/upload/v1768244891/my-app-uploads/hydwzteebguygp6fg3ak.jpg",
      badge: "ملك الخلية",
      detailedInfo: {
        benefits: [
          "يعزز الطاقة والقدرة على التركيز بفعالية عالية",
          "يساهم في تحسين المزاج والتوازن العصبي",
          "يغذي خلايا الجلد ويمنح الشعر إشراقة صحية",
          "يدعم الجهاز المناعي في فترات الضغط",
          "مركب طبيعي مضاد لعلامات التقدم في السن"
        ],
        uses: [
          "يُستخدم صباحاً لتعزيز الطاقة والنشاط العقلي",
          "مثالي للرياضيين ومحبي الأداء العالي",
          "يدعم الصحة الهرمونية والمزاج خاصة للنساء",
          "يساهم في دعم الخصوبة وتنظيم الهرمونات الأنثوية",
          "يساعد في تحسين نوعية السائل المنوي للرجال",
          "تحسين الأداء العام للدماغ والجهاز العصبي"
        ],
        properties: [
          "غذاء ملكات نقي ومركز وطازج",
          "مصدر طبيعي للأحماض الدهنية المحفزة للهرمونات (مثل 10-HDA)",
          "يدعم الخصوبة من خلال تنظيم الهرمونات الأنثوية",
          "يساهم في تحسين نوعية الحيوانات المنوية لدى الرجال",
          "غني بالفيتامينات B، خاصة B5 وB6 الضرورية للتوازن الهرموني",
          "منتج فاخر يستخلص من الخلايا الملكية",
          "يُحفظ مبرداً للحفاظ على الفعالية الحيوية"
        ],
        howToUse: "تناول 1–2 جرام يومياً على الريق (حوالي نصف ملعقة صغيرة). يُفضل وضعه تحت اللسان لمدة دقيقة قبل بلعه لامتصاص مثالي. يُحفظ دائماً في الثلاجة."
      }
    },
    {
      name: "غبار الطلع (Bee Pollen)",
      benefit: "تركيبة الفيتامينات الخام الطبيعية",
      desc: "قوة التركيز والتحمل في ملعقة – تركيبة طبيعية شاملة.",
      image: "https://res.cloudinary.com/dkbvnupge/image/upload/v1768231434/my-app-uploads/yj1bi1wvcpcqlbcqodnv.jpg",
      detailedInfo: {
        benefits: [
          "مكمل غذائي متكامل من الطبيعة",
          "يعزز التركيز الذهني والطاقة الجسدية",
          "يدعم عملية الهضم والتمثيل الغذائي",
          "يعزز مناعة الجسم خاصة في التغيرات الموسمية",
          "يساهم في التوازن الغذائي للرياضيين والطلاب"
        ],
        uses: [
          "يُستخدم صباحاً لتحفيز النشاط والتركيز",
          "دعم الأداء البدني والعقلي للرياضيين",
          "تحسين الحالة الذهنية أثناء فترات الضغط أو الدراسة",
          "تعزيز المناعة العامة والوظائف الحيوية"
        ],
        properties: [
          "غبار طلع خام نقي 100%",
          "غني بالفيتامينات (خصوصاً B) والمعادن",
          "مصدر بروتين نباتي طبيعي",
          "مستخرج من زهور بريّة مختارة بعناية"
        ],
        howToUse: "ابدأ بربع ملعقة صغيرة يومياً، وزد تدريجياً حتى ملعقة كبيرة. يمكن تناوله مباشرة، أو خلطه مع العسل أو العصير أو الزبادي. يُنصح بمضغه جيداً لزيادة الامتصاص الحيوي، ويفضّل تناوله صباحاً."
      }
    }
  ]
}

];

const StoreProductGroupSection = memo(({ group, onProductClick }: { group: ProductGroup; onProductClick: (item: ProductItem) => void }) => (
  <div className="mb-32">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-16"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
          {group.icon}
        </div>
        <h3 className="text-3xl md:text-4xl font-amiri font-bold text-white">
          {group.title}
        </h3>
      </div>
      <p className="text-zinc-500 max-w-2xl border-r-2 border-amber-500/20 pr-4">
        {group.subtitle}
      </p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {group.items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="group relative bg-zinc-900/40 rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-amber-500/20 transition-all duration-500 cursor-pointer"
          onClick={() => onProductClick(item)}
        >
          <div className="relative h-72 overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
            {item.badge && (
              <div className="absolute top-6 right-6 bg-amber-500 text-zinc-950 text-[10px] font-black px-4 py-1 rounded-full uppercase z-10">
                {item.badge}
              </div>
            )}
            <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Eye className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-2xl font-amiri font-bold text-white group-hover:text-amber-400 transition-colors">
                {item.name}
              </h4>
              <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                {item.benefit}
              </span>
            </div>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed line-clamp-2">
              {item.desc}
            </p>
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onProductClick(item);
                }}
                className="flex-1 py-3 bg-zinc-800 border border-amber-500/30 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-500/10 transition-all duration-300 font-bold text-sm"
              >
                <Eye className="w-4 h-4" />
                التفاصيل
              </button>
              <a
                href={getWhatsAppLink(`مرحباً عسل الهيثم، أود الاستفسار عن المنتج المعروض في الموقع: ${item.name}`)}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 py-3 bg-amber-500 text-zinc-950 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-400 transition-all duration-300 font-bold text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                اطلب الآن
              </a>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
));

export const Store: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductClick = useCallback((product: ProductItem) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-32">
      <Helmet>
        <title>متجر الهيثم - منتجات النحل الطبيعية</title>
        <meta name="description" content="تسوق أفضل أنواع العسل الطبيعي، عسل حبة البركة، عسل الدردار، وعسل الجيجان. منتجات طبيعية 100% ومفحوصة مخبرياً." />
        <meta property="og:title" content="متجر الهيثم - منتجات النحل الطبيعية" />
        <meta property="og:description" content="تسوق أفضل أنواع العسل الطبيعي، عسل حبة البركة، عسل الدردار، وعسل الجيجان. منتجات طبيعية 100% ومفحوصة مخبرياً." />
      </Helmet>
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              <span>العودة للرئيسية</span>
            </Link>
          </div>
          <h1 className="text-5xl md:text-7xl font-amiri font-bold text-white mb-4">
            متجر الهيثم
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            اكتشف مجموعتنا الكاملة من منتجات النحل الطبيعية عالية الجودة
          </p>
        </motion.div>

        {/* Products Grid */}
        {groups.map((group) => (
          <StoreProductGroupSection 
            key={group.id} 
            group={group} 
            onProductClick={handleProductClick} 
          />
        ))}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};
