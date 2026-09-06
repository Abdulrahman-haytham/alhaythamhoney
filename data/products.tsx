import React from 'react';
import { Droplets, Sparkles } from 'lucide-react';

export interface ProductPrice {
  amount: number;
  unit: 'كغ' | 'غرام' | 'قطعة';
  note?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  desc: string;
  image: string;
  badge?: string;
  benefit?: string;
  // TODO: set per-product prices as they're confirmed; left unset for now,
  // so the UI falls back to PRICE_UNAVAILABLE_TEXT everywhere it's shown.
  price?: ProductPrice;
  detailedInfo?: {
    uses?: string[];
    benefits?: string[];
    properties?: string[];
    howToUse?: string;
  };
}

export const PRICE_UNAVAILABLE_TEXT = 'السعر حسب الموسم — اسأل عبر واتساب';

export function formatProductPrice(price?: ProductPrice): string {
  if (!price) {
    return PRICE_UNAVAILABLE_TEXT;
  }
  const base = `${price.amount} / ${price.unit}`;
  return price.note ? `${base} — ${price.note}` : base;
}

export interface ProductGroup {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  items: ProductItem[];
  layout: 'grid' | 'lab';
}

export const groups: ProductGroup[] = [
  {
    id: "core-honey",
    title: "كنوز النحل – عسل صافي من مراعي مختارة",
    subtitle: "نبدأ بما هو مألوف لنصل إلى أعماق النقاء",
    icon: <Droplets className="w-6 h-6 text-amber-500" />,
    layout: 'grid',
    items: [
      {
        id: "black-seed-honey",
        name: "عسل حبة البركة",
        benefit: "دعم المناعة",
        desc: "القوة السوداء ونكهة عريقة، مستخلص لضمان أعلى الفوائد المناعية.",
        image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=800",
        badge: "الأكثر طلباً",
        detailedInfo: {
          benefits: [
            "يُستخدم تقليدياً لدعم الجهاز المناعي",
            "يُعرف شعبياً بخصائصه المضادة للالتهاب والبكتيريا",
            "تحسين صحة الجهاز التنفسي",
            "دعم صحة القلب والأوعية الدموية",
            "غني بمضادات الأكسدة الطبيعية"
          ],
          uses: [
            "تناول ملعقة صباحاً على الريق",
            "مزجه مع الماء الدافئ والليمون",
            "استخدامه كبديل طبيعي للسكر",
            "يُستخدم تقليدياً موضعياً في العناية بالبشرة"
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
        id: "dardar-honey",
        name: "عسل الدردار",
        benefit: "طاقة وتنفس",
        desc: "طعم الطبيعة السورية الأصيل، رحيق نادر يجسد عراقة الأرض.",
        image: "https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1768245563/my-app-uploads/bdtoimsuk9sjkirvpvbw.jpg",
        detailedInfo: {
          benefits: [
            "تحسين وظائف الجهاز التنفسي",
            "يُستخدم تقليدياً لتهدئة السعال والحلق",
            "مصدر طبيعي للطاقة السريعة",
            "دعم صحة الجهاز الهضمي",
            "تعزيز النشاط البدني"
          ],
          uses: [
            "يُستخدم تقليدياً للتخفيف من أعراض السعال والبرد",
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
        id: "jejan-honey",
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
        id: "propolis",
        name: "العكبر (Propolis)",
        benefit: "درع مناعي طبيعي لجسمك",
        desc: "يُستخدم تقليدياً لدعم دفاعات الجسم الطبيعية بشكل آمن. مثالي لمن يريد إضافة يومية طبيعية لروتينه الصحي.",
        image: "https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1769091916/my-app-uploads/mrtsg6k6rv9tj63pxmxv.jpg"
      },
      {
        id: "royal-jelly",
        name: "غذاء ملكات النحل",
        benefit: "إكسير النشاط والحيوية",
        desc: "طاقة وتركيز طوال اليوم. غذاء ملكي فاخر يدعم المناعة ويجدد النشاط.",
        image: "https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1769091831/my-app-uploads/i40xuoyv6v171ppporjy.jpg",
        badge: "ملك الخلية"
      },
      {
        id: "pollen",
        name: "غبار الطلع",
        benefit:"فيتامينات ومعادن من الطبيعة",
        desc: "مكمل غذائي غني بالبروتين. مثالي للرياضيين ولمن يبحث عن طاقة طبيعية مستدامة.",
        image: "https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1769091882/my-app-uploads/seldz3u4kxhpfqeprkbs.jpg",
        detailedInfo: {
          benefits: [
            "يُعرف شعبياً كمقوٍّ طبيعي للجسم",
            "تقوية الجهاز المناعي",
            "يُستخدم تقليدياً لدعم مقاومة الجسم الطبيعية",
            "يُستخدم شعبياً في العناية التقليدية بالبشرة",
            "دعم صحة الفم والأسنان"
          ],
          uses: [
            "مضغ قطعة صغيرة يومياً",
            "استخدامه كغرغرة للفم",
            "يُستخدم تقليدياً موضعياً للعناية بالبشرة",
            "مكمل غذائي يومي"
          ],
          properties: [
            "مستخرج من خلايا النحل",
            "غني بالفلافونويدات",
            "مضاد أكسدة قوي",
            "طبيعي 100%"
          ],
          howToUse: "يمكن مضغ قطعة صغيرة (حجم حبة البازلاء) يومياً، أو استخدامه كغرغرة بعد إذابته في الماء. للاستخدام الموضعي، يُطبق مباشرة على المنطقة المطلوبة."
        }
      }
    ]
  }
];