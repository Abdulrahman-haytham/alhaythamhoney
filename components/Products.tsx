import React, { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, FlaskConical, Sparkles, Droplets, Eye } from 'lucide-react';
import { ProductDetailModal } from './ProductDetailModal';

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
        image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=800",
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
            "مستخلص من حبة البركة الأصيلة",
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
            "عسل نادر من أشجار الدردار",
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
        image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&q=80&w=800",
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
    subtitle: "منتجات طبيعية تُستخدم منذ قرون لدعم الجسد بذكاء",
    icon: <Sparkles className="w-6 h-6 text-amber-500" />,
    layout: 'grid',
    items: [
      {
        name: "العكبر (Propolis)",
        benefit: "درع مناعي طبيعي لجسمك",
        desc: "يحميك من الالتهابات ويعزز دفاعات الجسم بشكل آمن وطبيعي. مثالي لمن يريد صحة يومية قوية بدون أدوية صناعية.",
        image: "https://res.cloudinary.com/dkbvnupge/image/upload/v1769091916/my-app-uploads/mrtsg6k6rv9tj63pxmxv.jpg"
      },
      {
        name: "غذاء ملكات النحل",
        benefit: "إكسير النشاط والحيوية",
        desc: "طاقة وتركيز طوال اليوم، تركيبة طبيعية مركزة تمنح الجسم النشاط المستمر، تحسن الأداء الذهني والبدني، وتدعم القدرة على الحيوية الشاملة والجنسية بطريقة طبيعية.مثالي لكل من يريد أن يشعر بالقوة والحيوية ويستمتع بحياة نشطة ومتوازنة.",
        image: "https://res.cloudinary.com/dkbvnupge/image/upload/v1769091831/my-app-uploads/i40xuoyv6v171ppporjy.jpg",
        badge: "ملك الخلية"
      },
      {
        name: "غبار الطلع",
        benefit:"فيتامينات ومعادن من الطبيعة",
        desc: "مكمل غذائي غني بالبروتين والمعادن الأساسية لدعم الصحة العامة، زيادة النشاط، وتحسين التركيز لكل من يعمل أو يدرس أو يمارس الرياضة.",
        image: "https://res.cloudinary.com/dkbvnupge/image/upload/v1769091882/my-app-uploads/seldz3u4kxhpfqeprkbs.jpg",
        detailedInfo: {
          benefits: [
            "مضاد حيوي طبيعي قوي",
            "تقوية الجهاز المناعي",
            "مقاومة الالتهابات والفيروسات",
            "شفاء الجروح والحروق",
            "دعم صحة الفم والأسنان"
          ],
          uses: [
            "مضغ قطعة صغيرة يومياً",
            "استخدامه كغرغرة للفم",
            "تطبيقه موضعياً على الجروح",
            "مكمل غذائي للوقاية"
          ],
          properties: [
            "مستخرج من خلايا النحل",
            "غني بالفلافونويدات",
            "مضاد أكسدة قوي",
            "طبيعي 100%"
          ],
          howToUse: "يمكن مضغ قطعة صغيرة (حجم حبة البازلاء) يومياً، أو استخدامه كغرغرة بعد إذابته في الماء. للاستخدام الموضعي، يُطبق مباشرة على المنطقة المصابة."
        }
      }
    ]
  }
];

const ProductGroupSection = memo(({ group, onProductClick }: { group: ProductGroup; onProductClick: (item: ProductItem) => void }) => (
  <div className="mb-16 sm:mb-24 md:mb-32">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-8 sm:mb-12 md:mb-16"
    >
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 md:mb-4">
        <div className="p-2 sm:p-2.5 md:p-3 bg-amber-500/10 rounded-lg sm:rounded-xl border border-amber-500/20">
          <div className="scale-75 sm:scale-90 md:scale-100">{group.icon}</div>
        </div>
        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-amiri font-bold text-white">{group.title}</h3>
      </div>
      <p className="text-zinc-500 text-sm sm:text-base max-w-2xl border-r-2 border-amber-500/20 pr-3 sm:pr-4">{group.subtitle}</p>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
      {group.items.map((item, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="group relative bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 backdrop-blur-sm rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-amber-500/40 transition-all duration-500 cursor-pointer luxury-shadow hover:luxury-shadow-lg"
          onClick={() => onProductClick(item)}
        >
          <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden">
            <img 
              src={item.image} 
              alt={`${item.name} - عسل طبيعي 100% من الهيثم لنحل وعسل في سوريا`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {item.badge && (
              <div className="absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-[9px] sm:text-[10px] font-black px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 rounded-full uppercase z-10 shadow-lg golden-glow">
                {item.badge}
              </div>
            )}
          </div>
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-amiri font-bold text-white group-hover:text-amber-400 transition-colors flex-1">{item.name}</h2>
              <span className="text-[9px] sm:text-[10px] bg-amber-500/10 text-amber-500 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-bold uppercase tracking-wider whitespace-nowrap">{item.benefit}</span>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed line-clamp-2">{item.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
));

export const Products: React.FC = () => {
  const phoneNumber = "+963947931959";
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
    <section id="products" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-zinc-950">
      <div className="container mx-auto">
        {groups.map((group) => (
          <ProductGroupSection 
            key={group.id} 
            group={group} 
            onProductClick={handleProductClick} 
          />
        ))}

        {/* Product Detail Modal */}
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          phoneNumber={phoneNumber}
        />
      </div>
    </section>
  );
};
