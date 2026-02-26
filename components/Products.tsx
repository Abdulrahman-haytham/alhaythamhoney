import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye } from 'lucide-react';
import { groups, ProductItem, ProductGroup } from '../data/products';
import { Link } from 'react-router-dom';
import { getWhatsAppLink } from '../config/site';

const ProductGroupSection = memo(({ group }: { group: ProductGroup }) => (
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
          className="group relative bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 backdrop-blur-sm rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-amber-500/40 transition-all duration-500 cursor-pointer luxury-shadow hover:luxury-shadow-lg flex flex-col"
        >
          <Link to={`/product/${item.id}`} className="block relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden flex-shrink-0">
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
          </Link>
          <div className="p-4 sm:p-6 md:p-8 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
              <Link to={`/product/${item.id}`} className="flex-1">
                <h2 className="text-lg sm:text-xl md:text-2xl font-amiri font-bold text-white group-hover:text-amber-400 transition-colors">{item.name}</h2>
              </Link>
              <span className="text-[9px] sm:text-[10px] bg-amber-500/10 text-amber-500 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-bold uppercase tracking-wider whitespace-nowrap">{item.benefit}</span>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed line-clamp-2 flex-grow">{item.desc}</p>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-auto pt-4 border-t border-white/5">
              <Link 
                to={`/product/${item.id}`}
                className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 group/btn"
              >
                <Eye className="w-4 h-4 group-hover/btn:text-amber-500 transition-colors" />
                تفاصيل
              </Link>
              <a
                href={getWhatsAppLink(`مرحباً، أريد طلب ${item.name}`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5"
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

export const Products: React.FC = () => {
  return (
    <section id="products" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-zinc-950">
      <div className="container mx-auto">
        {groups.map((group) => (
          <ProductGroupSection 
            key={group.id} 
            group={group} 
          />
        ))}
      </div>
    </section>
  );
};
