import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, CheckCircle2, Leaf, Heart, Zap } from 'lucide-react';
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

interface ProductDetailModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-zinc-900 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] border border-amber-500/20 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 z-10 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-zinc-800/80 border border-white/10 flex items-center justify-center hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-white" />
              </button>

              {/* Content */}
              <div className="flex flex-col lg:flex-row">
                {/* Image Section */}
                <div className="lg:w-1/2 relative h-64 sm:h-80 md:h-96 lg:h-auto">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
                  {product.badge && (
                    <div className="absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6 bg-amber-500 text-zinc-950 text-[10px] sm:text-xs font-black px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full uppercase z-10">
                      {product.badge}
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="lg:w-1/2 p-4 sm:p-6 md:p-8 lg:p-12 space-y-4 sm:space-y-5 md:space-y-6">
                  {/* Title */}
                  <div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-amiri font-bold text-white mb-2 sm:mb-3">
                      {product.name}
                    </h2>
                    {product.benefit && (
                      <span className="inline-block text-xs sm:text-sm bg-amber-500/10 text-amber-500 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold uppercase tracking-wider border border-amber-500/20">
                        {product.benefit}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-zinc-300 text-sm sm:text-base md:text-lg leading-relaxed">
                    {product.desc}
                  </p>

                  {/* Detailed Information */}
                  {product.detailedInfo && (
                    <div className="space-y-4 sm:space-y-5 md:space-y-6 pt-3 sm:pt-4 border-t border-white/10">
                      {/* Benefits */}
                      {product.detailedInfo.benefits && (
                        <div>
                          <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                            <h3 className="text-lg sm:text-xl font-amiri font-bold text-white">الفوائد الصحية</h3>
                          </div>
                          <ul className="space-y-1.5 sm:space-y-2">
                            {product.detailedInfo.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-2 sm:gap-3 text-zinc-300 text-sm sm:text-base">
                                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Uses */}
                      {product.detailedInfo.uses && (
                        <div>
                          <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                            <h3 className="text-lg sm:text-xl font-amiri font-bold text-white">الاستخدامات</h3>
                          </div>
                          <ul className="space-y-1.5 sm:space-y-2">
                            {product.detailedInfo.uses.map((use, idx) => (
                              <li key={idx} className="flex items-start gap-2 sm:gap-3 text-zinc-300 text-sm sm:text-base">
                                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <span>{use}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Properties */}
                      {product.detailedInfo.properties && (
                        <div>
                          <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                            <h3 className="text-lg sm:text-xl font-amiri font-bold text-white">الخصائص</h3>
                          </div>
                          <ul className="space-y-1.5 sm:space-y-2">
                            {product.detailedInfo.properties.map((property, idx) => (
                              <li key={idx} className="flex items-start gap-2 sm:gap-3 text-zinc-300 text-sm sm:text-base">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                <span>{property}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* How to Use */}
                      {product.detailedInfo.howToUse && (
                        <div className="bg-zinc-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-amber-500/10">
                          <h3 className="text-base sm:text-lg font-amiri font-bold text-white mb-1.5 sm:mb-2">طريقة الاستخدام</h3>
                          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">{product.detailedInfo.howToUse}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="pt-4 sm:pt-5 md:pt-6">
                    <a
                      href={getWhatsAppLink(`أريد طلب ${product.name}`)}
                      className="w-full py-3 sm:py-3.5 md:py-4 bg-amber-500 text-zinc-950 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 hover:bg-amber-400 transition-all duration-300 font-bold text-sm sm:text-base md:text-lg"
                    >
                      <ShoppingCart className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
                      اطلب الآن عبر واتساب
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
