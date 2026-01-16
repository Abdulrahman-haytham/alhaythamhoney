import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Sparkles, Droplets, Eye, ArrowRight } from 'lucide-react';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { Link } from 'react-router-dom';

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
        benefit: "مضاد حيوي طبيعي",
        desc: "درع حماية فائق لمناعتك من قلب الخلية.",
        image: "https://res.cloudinary.com/dkbvnupge/image/upload/v1768245473/my-app-uploads/ynkkzbdxrtsfvptrclle.jpg",
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
      },
      {
        name: "غذاء ملكات النحل",
        benefit: "إصدار فاخر",
        desc: "منبع الحيوية والنشاط الدائم، مركز طاقة نقي.",
        image: "https://res.cloudinary.com/dkbvnupge/image/upload/v1768244891/my-app-uploads/hydwzteebguygp6fg3ak.jpg",
        badge: "ملك الخلية",
        detailedInfo: {
          benefits: [
            "تعزيز الطاقة والحيوية",
            "تحسين الذاكرة والتركيز",
            "دعم صحة الجلد والشعر",
            "تقوية المناعة",
            "مضاد للشيخوخة"
          ],
          uses: [
            "تناول يومي للطاقة",
            "دعم الأداء الرياضي",
            "تحسين المزاج والحيوية",
            "دعم صحة المرأة"
          ],
          properties: [
            "غذاء الملكات النقي",
            "غني بالبروتينات والفيتامينات",
            "مستخرج طازج من الخلية",
            "منتج فاخر عالي الجودة"
          ],
          howToUse: "تناول 1-2 جرام يومياً على الريق (حوالي نصف ملعقة صغيرة). يُنصح بوضعه تحت اللسان لمدة دقيقة قبل البلع لامتصاص أفضل. يُحفظ في الثلاجة."
        }
      },
      {
        name: "غبار الطلع",
        benefit: "فيتامينات خام",
        desc: "مكمل غذائي متكامل لزيادة التركيز والطاقة.",
        image: "https://res.cloudinary.com/dkbvnupge/image/upload/v1768231434/my-app-uploads/yj1bi1wvcpcqlbcqodnv.jpg",
        detailedInfo: {
          benefits: [
            "مكمل غذائي متكامل",
            "زيادة الطاقة والتحمل",
            "تحسين التركيز والذاكرة",
            "دعم صحة الجهاز الهضمي",
            "تقوية المناعة"
          ],
          uses: [
            "مكمل غذائي يومي",
            "للرياضيين والأداء العالي",
            "دعم الطلاب والتركيز",
            "تحسين الصحة العامة"
          ],
          properties: [
            "غبار طلع نقي",
            "غني بالفيتامينات والمعادن",
            "مصدر بروتين طبيعي",
            "مستخرج من الزهور البرية"
          ],
          howToUse: "تناول ملعقة صغيرة إلى ملعقة كبيرة يومياً. يمكن تناوله مباشرة أو مزجه مع العسل أو العصير. يُنصح بالبدء بكمية صغيرة وزيادتها تدريجياً."
        }
      }
    ]
  }
];

export const Store: React.FC = () => {
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-32">
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
          <div key={group.id} className="mb-32">
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
                  onClick={() => handleProductClick(item)}
                >
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
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
                          handleProductClick(item);
                        }}
                        className="flex-1 py-3 bg-zinc-800 border border-amber-500/30 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-500/10 transition-all duration-300 font-bold text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        التفاصيل
                      </button>
                      <a
                        href={`https://wa.me/${phoneNumber}?text=أريد طلب ${item.name}`}
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
        ))}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        phoneNumber={phoneNumber}
      />
    </div>
  );
};
