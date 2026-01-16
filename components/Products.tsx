
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, FlaskConical, Sparkles, Droplets, ChevronLeft, Eye } from 'lucide-react';
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
        image: "https://images.unsplash.com/photo-1555035336-54a2c0022394?auto=format&fit=crop&q=80&w=800"
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
        image: "https://images.unsplash.com/photo-1510627489930-0c1b0ba996e9?auto=format&fit=crop&q=80&w=800"
      },
      {
        name: "غذاء ملكات النحل",
        benefit: "إكسير النشاط والحيوية",
        desc: "طاقة وتركيز طوال اليوم، تركيبة طبيعية مركزة تمنح الجسم النشاط المستمر، تحسن الأداء الذهني والبدني، وتدعم القدرة على الحيوية الشاملة والجنسية بطريقة طبيعية.مثالي لكل من يريد أن يشعر بالقوة والحيوية ويستمتع بحياة نشطة ومتوازنة.",
        image: "https://images.unsplash.com/photo-1621236378699-8597fac6bb4d?auto=format&fit=crop&q=80&w=800",
        badge: "ملك الخلية"
      },
      {
        name: "غبار الطلع",
        benefit:"فيتامينات ومعادن من الطبيعة",
        desc: "مكمل غذائي غني بالبروتين والمعادن الأساسية لدعم الصحة العامة، زيادة النشاط، وتحسين التركيز لكل من يعمل أو يدرس أو يمارس الرياضة.",
        image: "https://images.unsplash.com/photo-1471943311424-646960669fba?auto=format&fit=crop&q=80&w=800"
      }
    ]
  }
];

export const Products: React.FC = () => {
  const phoneNumber = "963930112994";
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductClick = (product: ProductItem) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <section id="products" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-zinc-950">
      <div className="container mx-auto">
        {groups.map((group) => (
          <div key={group.id} className="mb-16 sm:mb-24 md:mb-32">
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
                  onClick={() => handleProductClick(item)}
                >
                  <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={`${item.name} - عسل طبيعي 100% من الهيثم لنحل وعسل في سوريا`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent group-hover:from-zinc-950/80 group-hover:via-zinc-950/20 transition-all duration-500"></div>
                    {item.badge && (
                      <div className="absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-[9px] sm:text-[10px] font-black px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 rounded-full uppercase z-10 shadow-lg golden-glow">
                        {item.badge}
                      </div>
                    )}
                    <div className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 bg-black/50 backdrop-blur-sm rounded-full p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6 md:p-8">
                    <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-amiri font-bold text-white group-hover:text-amber-400 transition-colors flex-1">{item.name}</h2>
                      <span className="text-[9px] sm:text-[10px] bg-amber-500/10 text-amber-500 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-bold uppercase tracking-wider whitespace-nowrap">{item.benefit}</span>
                    </div>
                    <p className="text-zinc-400 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed line-clamp-2">{item.desc}</p>
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(item);
                        }}
                        className="flex-1 py-2 sm:py-2.5 md:py-3 bg-zinc-800 border border-amber-500/30 rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-amber-500/10 transition-all duration-300 font-bold text-xs sm:text-sm"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">التفاصيل</span>
                        <span className="sm:hidden">تفاصيل</span>
                      </button>
                      <a 
                        href={`https://wa.me/${phoneNumber}?text=أريد طلب ${item.name}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-2 sm:py-2.5 md:py-3 bg-amber-500 text-zinc-950 rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-amber-400 transition-all duration-300 font-bold text-xs sm:text-sm"
                      >
                        <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">اطلب الآن</span>
                        <span className="sm:hidden">طلب</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* 6. المختبر الملكي – نقطة التميّز الحاسمة */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative group overflow-hidden rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] bg-zinc-900/30 border border-amber-500/10 p-1 sm:p-1.5"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-50"></div>
          
          <div className="relative z-10 p-6 sm:p-10 md:p-16 lg:p-20 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-[2.5rem] lg:rounded-[2.9rem] flex flex-col lg:flex-row gap-8 sm:gap-12 md:gap-16 items-center">
            <div className="lg:w-3/5 space-y-4 sm:space-y-6 md:space-y-8 text-right">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                <span className="text-amber-500 text-[10px] sm:text-xs font-black tracking-wider sm:tracking-widest uppercase">ثالثاً: المختبر الملكي</span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-amiri font-bold text-white leading-tight">خلطات تُصمَّم لك… <br /><span className="gold-text">لا للجميع</span></h3>
              <p className="text-zinc-400 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl">
                نركّب خلطتك الخاصة حسب احتياجك الصحي الدقيق، اعتمادًا على خبرتنا ومكونات نحل نقية. لا نبيع منتجاً جاهزاً فحسب، بل نصمم لك حلاً صحياً فريداً.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  { label: 'خلطات المناعة', desc: 'لتقوية الدفاعات الطبيعية' },
                  { label: 'النشاط البدني', desc: 'للرياضيين والأداء العالي' },
                  { label: 'الطاقة القصوى', desc: 'لتركيز حاد ونشاط يومي' },
                  { label: 'الخلطات الجنسية الطبيعية', desc: 'للقوة والرجولة بذكاء الطبيعة' }
                ].map((mix, i) => (
                  <div key={i} className="flex gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-950/50 border border-white/5 group/card hover:border-amber-500/30 transition-all">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 mt-1.5 sm:mt-2 flex-shrink-0"></div>
                    <div>
                      <h5 className="text-white font-bold text-sm sm:text-base">{mix.label}</h5>
                      <p className="text-zinc-500 text-[10px] sm:text-xs">{mix.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-2/5 flex flex-col items-center gap-6 sm:gap-8">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80">
                <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative w-full h-full rounded-full border-2 border-amber-500/20 flex items-center justify-center bg-zinc-950/80 luxury-shadow">
                  <FlaskConical className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 text-amber-500/80" />
                </div>
              </div>
              <a 
                href={`https://wa.me/${phoneNumber}?text=أريد استشارة حول خلطة خاصة`}
                className="group w-full max-w-sm px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 gold-gradient rounded-full text-zinc-950 font-black text-base sm:text-lg md:text-xl lg:text-2xl text-center luxury-shadow hover:scale-105 transition-all"
              >
                📞 استشرنا عبر واتساب
              </a>
              <p className="text-zinc-500 text-xs sm:text-sm font-medium text-center px-4">نركب خلطتك حسب احتياجك الصحي الدقيق</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        phoneNumber={phoneNumber}
      />
    </section>
  );
};
