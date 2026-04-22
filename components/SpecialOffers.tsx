import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gift, ShoppingCart, Clock } from 'lucide-react';
import { getWhatsAppLink } from '../config/site';

export const SpecialOffers: React.FC = () => {
  const offers = [
    {
        id: 1,
        title: 'باقة الجملة الذهبية',
        description: 'احصل على عسل طبيعي مع خصم 7% ودفع عند البيع',
        price: 'سعر خاص للمحلات',
        badge: 'عرض المحلات',
        icon: <Gift className="w-8 h-8 text-amber-500" />
      },
    {
      id: 2,
      title: 'باقة العائلة',
      description: '5 كيلو عسل طبيعي مختلط',
      price: 'خصم 6 %',
      badge: 'عرض خاص',
      icon: <Sparkles className="w-8 h-8 text-amber-500" />
    },
    {
      id: 3,
      title: 'اشتراك شهري',
      description: 'احصل على عسل طازج كل شهر',
      price: 'شحن مجاني ',
      badge: 'جديد',
      icon: <Clock className="w-8 h-8 text-amber-500" />
    }
  ];

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-gradient-to-b from-zinc-950 via-amber-950/5 to-zinc-950 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(184,134,11,0.1),transparent_50%)]"></div>
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <span className="text-amber-500 font-bold tracking-[0.4em] uppercase text-xs italic">
              Special Offers
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-amiri font-black mb-5 text-white leading-tight">
            عروض حصرية لفترة محدودة
          </h2>
          <div className="w-16 h-1 bg-amber-500/70 rounded-full mx-auto mb-6" />
          <p className="text-zinc-400 text-sm sm:text-lg max-w-2xl mx-auto">
            استفد من عروضنا الخاصة واحصل على أفضل قيمة مقابل المال
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {offers.map((offer, idx) => (
            <motion.div
              key={offer.id}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="group relative bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border border-amber-500/25 hover:border-amber-500/50 transition-all duration-500 hover:scale-[1.02] overflow-hidden"
            >
              {/* Animated Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-500/20 group-hover:via-amber-500/10 group-hover:to-amber-500/0 transition-all duration-700"></div>
              
              {/* Badge */}
              {offer.badge && (
                <div className="absolute top-4 right-4 bg-amber-500 text-zinc-950 text-[10px] font-black px-3 py-1.5 rounded-full uppercase z-10 shadow-lg">
                  {offer.badge}
                </div>
              )}

              <div className="relative z-10">
                {/* Icon */}
                <div className="mb-5 flex justify-center">
                  <div className="p-3 bg-amber-500/15 rounded-2xl border border-amber-500/25 group-hover:bg-amber-500/25 transition-all duration-300">
                    {offer.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl sm:text-2xl font-amiri font-black text-white mb-3 text-center group-hover:text-amber-400 transition-colors leading-tight">
                  {offer.title}
                </h3>
                <p className="text-zinc-400 text-center mb-5 leading-relaxed text-sm sm:text-base">
                  {offer.description}
                </p>

                {/* Price */}
                <div className="text-center mb-5">
                  <span className="text-2xl sm:text-3xl font-black gold-text">{offer.price}</span>
                </div>

                {/* CTA */}
                <a
                  href={getWhatsAppLink(`أريد ${offer.title}`)}
                  className="block w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 rounded-xl font-black text-center hover:from-amber-400 hover:to-amber-500 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-amber-500/20 text-sm sm:text-base"
                >
                  <ShoppingCart className="w-5 h-5 inline-block ml-2" />
                  اطلب الآن
                </a>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-amber-500/15 rounded-tl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-amber-500/15 rounded-br-3xl"></div>
            </motion.div>
          ))}
        </div>

        {/* Limited Time Notice */}
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-6 py-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-amber-400 font-bold text-sm">
              ⏰ العروض محدودة - استفد الآن قبل انتهاء العرض
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
