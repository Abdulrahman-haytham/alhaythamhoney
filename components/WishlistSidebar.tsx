import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { Link } from 'react-router-dom';
import { getWhatsAppLink } from '../config/site';
import { Image } from './Image';

export const WishlistSidebar: React.FC = () => {
  const { state, removeItem, closeWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();

  const handleMoveToCart = (item: { id: string; name: string; image?: string }) => {
    addToCart({ id: item.id, name: item.name, image: item.image });
    removeItem(item.id);
  };

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[200]"
            onClick={closeWishlist}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-zinc-950 border-l border-zinc-800 z-[201] flex flex-col"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-bold text-zinc-100">
                  المفضلة ({state.items.length})
                </h2>
              </div>
              <button
                onClick={closeWishlist}
                className="p-2 text-zinc-500 hover:text-zinc-100 transition-colors"
                aria-label="إغلاق المفضلة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {state.items.length === 0 ? (
                <div className="text-center py-16 text-zinc-600">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">المفضلة فارغة</p>
                  <p className="text-sm mt-2 text-zinc-700">أضف منتجات تعجبك لتجدها هنا</p>
                  <Link
                    to="/shop"
                    onClick={closeWishlist}
                    className="inline-block mt-4 text-amber-500 hover:text-amber-400 font-bold"
                  >
                    تصفح المنتجات ←
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3 flex gap-3"
                    >
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.id}`} onClick={closeWishlist}>
                          <h3 className="font-bold text-zinc-100 truncate hover:text-amber-400 transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        {item.benefit && (
                          <span className="inline-block text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded mt-1">
                            {item.benefit}
                          </span>
                        )}
                        <div className="flex gap-2 mt-2">
                          <a
                            href={getWhatsAppLink(`مرحباً، أريد طلب ${item.name}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={closeWishlist}
                            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            طلب
                          </a>
                          <button
                            onClick={() => handleMoveToCart(item)}
                            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                            aria-label={`نقل ${item.name} إلى السلة`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            للسلة
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            إزالة
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="p-4 border-t border-zinc-800">
                <Link
                  to="/wishlist"
                  onClick={closeWishlist}
                  className="block w-full text-center py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-bold transition-colors"
                >
                  عرض المفضلة الكاملة
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
