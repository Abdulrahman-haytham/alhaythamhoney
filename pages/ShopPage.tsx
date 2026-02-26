import React, { memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye } from 'lucide-react';
import { groups, ProductItem, ProductGroup } from '../data/products';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getWhatsAppLink } from '../config/site';

const StoreProductGroupSection = memo(({ group }: { group: ProductGroup }) => (
  <div className="mb-20">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-12"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <div className="text-amber-500">{group.icon}</div>
        </div>
        <h3 className="text-3xl md:text-4xl font-amiri font-bold text-white">
          {group.title}
        </h3>
      </div>
      <p className="text-zinc-500 max-w-2xl border-r-2 border-amber-500/20 pr-4">
        {group.subtitle}
      </p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {group.items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="group relative bg-zinc-900/40 rounded-3xl overflow-hidden border border-white/5 hover:border-amber-500/30 transition-all duration-500 cursor-pointer flex flex-col h-full"
        >
          <Link to={`/product/${item.id}`} className="block relative h-64 overflow-hidden flex-shrink-0">
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
            {item.badge && (
              <div className="absolute top-4 right-4 bg-amber-500 text-zinc-950 text-[10px] font-black px-3 py-1 rounded-full uppercase z-10 shadow-lg">
                {item.badge}
              </div>
            )}
          </Link>

          <div className="p-6 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-3 gap-2">
              <Link to={`/product/${item.id}`} className="flex-1">
                <h4 className="text-xl font-amiri font-bold text-white group-hover:text-amber-400 transition-colors">
                  {item.name}
                </h4>
              </Link>
              <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded-md font-bold uppercase tracking-wider whitespace-nowrap">
                {item.benefit}
              </span>
            </div>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed line-clamp-3 flex-grow">
              {item.desc}
            </p>
            
            <div className="flex gap-3 mt-auto">
              <Link
                to={`/product/${item.id}`}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-bold text-sm"
              >
                <Eye className="w-4 h-4" />
                التفاصيل
              </Link>
              <a
                href={getWhatsAppLink(`مرحباً، أريد طلب ${item.name}`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-bold text-sm shadow-lg shadow-amber-500/20"
              >
                <ShoppingCart className="w-4 h-4" />
                طلب
              </a>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
));

export const ShopPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-16">
      <Helmet>
        <title>المتجر - الهيثم لنحل وعسل | تسوق العسل الطبيعي</title>
        <meta name="description" content="تسوق أفضل أنواع العسل الطبيعي، عسل حبة البركة، عسل الدردار، وعسل الجيجان. منتجات طبيعية 100% ومفحوصة مخبرياً." />
        <meta property="og:title" content="المتجر - الهيثم لنحل وعسل" />
        <meta property="og:description" content="تسوق منتجات النحل الطبيعية الأصلية من مناحل الهيثم." />
      </Helmet>
      
      <div className="container mx-auto px-4 sm:px-6">
        <Breadcrumbs items={[{ label: 'المتجر' }]} />

        {/* Page Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <ShoppingCart className="w-6 h-6 text-amber-500" />
            <span className="text-amber-500 font-bold tracking-[0.4em] uppercase text-xs italic">
              Our Store
            </span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-amiri font-bold text-white mb-6"
          >
            منتجاتنا الطبيعية
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto"
          >
            اخترنا لك أجود أنواع العسل ومنتجات النحل من الطبيعة السورية مباشرة إليك
          </motion.p>
        </div>

        {/* Products Grid */}
        {groups.map((group) => (
          <StoreProductGroupSection 
            key={group.id} 
            group={group} 
          />
        ))}
      </div>
    </div>
  );
};
