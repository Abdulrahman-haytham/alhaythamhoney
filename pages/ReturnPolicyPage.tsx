import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const ReturnPolicyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-12 flex flex-col justify-center">
      <Helmet>
        <title>سياسة الاسترجاع وضمان الجودة - الهيثم لنحل وعسل</title>
        <meta name="description" content="نضمن لك جودة منتجاتنا 100%. تعرف على سياسة الاسترجاع وضمان الجودة في مناحل الهيثم." />
        <meta name="robots" content="noindex" />
      </Helmet>
      
      <div className="container mx-auto px-4 mb-8">
        <Breadcrumbs items={[{ label: 'سياسة الاسترجاع' }]} />
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-amiri font-bold text-white mb-3">
            ضمان الجودة وسياسة الاسترجاع
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
            نلتزم في مناحل الهيثم بتقديم منتجات نحل طبيعية وعالية الجودة، لضمان رضاكم التام.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {/* Section 1 */}
          <PolicyCard
            delay={0}
            icon={<ShieldCheck className="w-5 h-5 text-amber-500" />}
            title="أولًا – ضمان الالتزام بالجودة"
            items={[
              { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, text: "نضمن مطابقة المنتج للمواصفات الطبيعية المعتمدة لدينا." },
              { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, text: "أي خلل في الجودة يُعتبر مسؤوليتنا المباشرة." }
            ]}
          />

          {/* Section 2 */}
          <PolicyCard
            delay={0.1}
            icon={<RefreshCw className="w-5 h-5 text-amber-500" />}
            title="ثانيًا – حالات الاسترجاع أو الاستبدال"
            items={[
              { icon: <CheckCircle2 className="w-4 h-4 text-amber-500" />, text: "في حال ثبوت عدم الالتزام بمعايير الجودة المتّفق عليها." },
              { icon: <CheckCircle2 className="w-4 h-4 text-amber-500" />, text: "وجود تلف أو كسر في العبوة عند الاستلام." },
              { icon: <CheckCircle2 className="w-4 h-4 text-amber-500" />, text: "وصول منتج مختلف عن الطلب." }
            ]}
          />

          {/* Section 3 */}
          <PolicyCard
            delay={0.2}
            icon={<AlertCircle className="w-5 h-5 text-amber-500" />}
            title="ثالثًا – شروط الاسترجاع"
            items={[
              { icon: <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />, text: "الإبلاغ خلال 24 ساعة من الاستلام." },
              { icon: <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />, text: "أن تكون العبوة غير مفتوحة، إلا في حال اكتشاف خلل." },
              { icon: <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />, text: "إرفاق صورة أو فيديو يوضّح المشكلة." }
            ]}
          />

          {/* Section 4 */}
          <PolicyCard
            delay={0.3}
            icon={<XCircle className="w-5 h-5 text-red-500" />}
            title="رابعًا – الحالات غير المشمولة"
            items={[
              { icon: <XCircle className="w-4 h-4 text-red-500/50" />, text: "عدم الرضا الشخصي المرتبط بالذوق أو التوقّعات." },
              { icon: <XCircle className="w-4 h-4 text-red-500/50" />, text: "سوء التخزين أو الاستخدام بعد الاستلام." }
            ]}
            borderColor="border-red-500/10"
            bgIconColor="bg-red-500/10"
          />

          {/* Section 5 */}
          <PolicyCard
            delay={0.4}
            icon={<RefreshCw className="w-5 h-5 text-amber-500" />}
            title="خامسًا – آلية المعالجة"
            items={[
              { icon: <RefreshCw className="w-4 h-4 text-amber-500" />, text: "يتم الاستبدال أو إعادة المبلغ كاملًا عند ثبوت الخلل." },
              { icon: <ShieldCheck className="w-4 h-4 text-amber-500" />, text: "نتحمّل كامل تكاليف الشحن المرتبطة بالحالة." },
              { icon: <CheckCircle2 className="w-4 h-4 text-amber-500" />, text: "نلتزم بمعالجة الطلب بسرعة وبما يحفظ حق الزبون." }
            ]}
          />

           {/* Footer Note as Card 6 */}
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="bg-amber-500/5 rounded-xl p-6 border border-amber-500/20 flex items-center justify-center text-center h-full"
          >
            <p className="text-amber-500 font-bold text-base md:text-lg leading-relaxed">
              📌 هذه السياسة تعكس التزامنا بالجودة، وتحفظ حق الزبون، وتضمن عدالة التعامل.
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

interface PolicyCardProps {
  delay: number;
  icon: React.ReactNode;
  title: string;
  items: { icon: React.ReactNode; text: string }[];
  borderColor?: string;
  bgIconColor?: string;
}

const PolicyCard: React.FC<PolicyCardProps> = ({ delay, icon, title, items, borderColor = "border-amber-500/10", bgIconColor = "bg-amber-500/10" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className={`bg-zinc-900/50 rounded-xl p-5 border ${borderColor} h-full hover:bg-zinc-900/80 transition-colors`}
  >
    <div className="flex items-start gap-3 mb-4">
      <div className={`p-2 ${bgIconColor} rounded-lg shrink-0`}>
        {icon}
      </div>
      <h2 className="text-lg font-amiri font-bold text-white pt-1">
        {title}
      </h2>
    </div>
    <ul className="space-y-2.5">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-3 text-zinc-300 text-sm leading-snug">
          <div className="mt-1 shrink-0">{item.icon}</div>
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  </motion.div>
);
