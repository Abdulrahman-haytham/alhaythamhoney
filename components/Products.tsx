
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, FlaskConical, Sparkles, Droplets, ChevronLeft } from 'lucide-react';

interface ProductItem {
  name: string;
  desc: string;
  image: string;
  badge?: string;
  benefit?: string;
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
        badge: "الأكثر طلباً"
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
        image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&q=80&w=800"
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
        image: "https://images.unsplash.com/photo-1510627489930-0c1b0ba996e9?auto=format&fit=crop&q=80&w=800"
      },
      {
        name: "غذاء ملكات النحل",
        benefit: "إصدار فاخر",
        desc: "منبع الحيوية والنشاط الدائم، مركز طاقة نقي.",
        image: "https://images.unsplash.com/photo-1621236378699-8597fac6bb4d?auto=format&fit=crop&q=80&w=800",
        badge: "ملك الخلية"
      },
      {
        name: "غبار الطلع",
        benefit: "فيتامينات خام",
        desc: "مكمل غذائي متكامل لزيادة التركيز والطاقة.",
        image: "https://images.unsplash.com/photo-1471943311424-646960669fba?auto=format&fit=crop&q=80&w=800"
      }
    ]
  }
];

export const Products: React.FC = () => {
  const phoneNumber = "963930112994";

  return (
    <section id="products" className="py-24 px-6 bg-zinc-950">
      <div className="container mx-auto">
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
                <h3 className="text-3xl md:text-4xl font-amiri font-bold text-white">{group.title}</h3>
              </div>
              <p className="text-zinc-500 max-w-2xl border-r-2 border-amber-500/20 pr-4">{group.subtitle}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {group.items.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative bg-zinc-900/40 rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-amber-500/20 transition-all duration-500"
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
                  </div>
                  
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-2xl font-amiri font-bold text-white group-hover:text-amber-400 transition-colors">{item.name}</h4>
                      <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded-md font-bold uppercase tracking-wider">{item.benefit}</span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-8 leading-relaxed line-clamp-2">{item.desc}</p>
                    <a 
                      href={`https://wa.me/${phoneNumber}?text=أريد طلب ${item.name}`}
                      className="w-full py-4 bg-zinc-950 border border-amber-500/20 rounded-2xl flex items-center justify-center gap-3 hover:bg-amber-500 hover:text-zinc-950 transition-all duration-300 font-bold"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      اطلب الآن
                    </a>
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
          className="relative group overflow-hidden rounded-[3rem] bg-zinc-900/30 border border-amber-500/10 p-1 md:p-1.5"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-50"></div>
          
          <div className="relative z-10 p-10 md:p-20 backdrop-blur-xl rounded-[2.9rem] flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-3/5 space-y-8 text-right">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                <FlaskConical className="w-5 h-5 text-amber-500" />
                <span className="text-amber-500 text-xs font-black tracking-widest uppercase">ثالثاً: المختبر الملكي</span>
              </div>
              <h3 className="text-5xl md:text-7xl font-amiri font-bold text-white">خلطات تُصمَّم لك… <br /><span className="gold-text">لا للجميع</span></h3>
              <p className="text-zinc-400 text-xl leading-relaxed max-w-3xl">
                نركّب خلطتك الخاصة حسب احتياجك الصحي الدقيق، اعتمادًا على خبرتنا ومكونات نحل نقية. لا نبيع منتجاً جاهزاً فحسب، بل نصمم لك حلاً صحياً فريداً.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: 'خلطات المناعة', desc: 'لتقوية الدفاعات الطبيعية' },
                  { label: 'النشاط البدني', desc: 'للرياضيين والأداء العالي' },
                  { label: 'الطاقة القصوى', desc: 'لتركيز حاد ونشاط يومي' },
                  { label: 'الخلطات الجنسية الطبيعية', desc: 'للقوة والرجولة بذكاء الطبيعة' }
                ].map((mix, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-zinc-950/50 border border-white/5 group/card hover:border-amber-500/30 transition-all">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
                    <div>
                      <h5 className="text-white font-bold">{mix.label}</h5>
                      <p className="text-zinc-500 text-xs">{mix.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-2/5 flex flex-col items-center gap-8">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative w-full h-full rounded-full border-2 border-amber-500/20 flex items-center justify-center bg-zinc-950/80 luxury-shadow">
                  <FlaskConical className="w-32 h-32 text-amber-500/80" />
                </div>
              </div>
              <a 
                href={`https://wa.me/${phoneNumber}?text=أريد استشارة حول خلطة خاصة`}
                className="group w-full max-w-sm px-10 py-6 gold-gradient rounded-full text-zinc-950 font-black text-2xl text-center luxury-shadow hover:scale-105 transition-all"
              >
                📞 استشرنا عبر واتساب
              </a>
              <p className="text-zinc-500 text-sm font-medium">نركب خلطتك حسب احتياجك الصحي الدقيق</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
