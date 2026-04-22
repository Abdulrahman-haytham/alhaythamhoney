import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { getWhatsAppLink } from '../config/site';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { groups } from '../data/products';
import { Meta } from '../components/Meta';
import { Image } from '../components/Image';

export const WishlistPage: React.FC = () => {
  const { state, removeItem, totalItems } = useWishlist();
  const { addItem: addToCart } = useCart();

  const handleMoveToCart = (item: { id: string; name: string; image?: string }) => {
    addToCart({ id: item.id, name: item.name, image: item.image });
    removeItem(item.id);
  };

  const handleMoveAllToCart = () => {
    state.items.forEach((item) => {
      addToCart({ id: item.id, name: item.name, image: item.image });
    });
    // Clear wishlist after moving all
    state.items.forEach((item) => removeItem(item.id));
  };

  // Find product details for each wishlist item
  const getWishlistItemsWithDetails = () => {
    const allProducts = groups.flatMap((g) => g.items);
    return state.items.map((wishlistItem) => {
      const product = allProducts.find((p) => p.id === wishlistItem.id);
      return { ...wishlistItem, product };
    });
  };

  const itemsWithDetails = getWishlistItemsWithDetails();

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-16" dir="rtl">
      <Meta title="المفضلة - الهيثم لنحل وعسل" description="منتجاتك المفضلة المحفوظة لوقت لاحق." />

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs items={[{ label: 'المفضلة' }]} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              <Heart className="w-6 h-6 text-red-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-amiri font-bold text-white">
              المفضلة
              {totalItems > 0 && (
                <span className="text-zinc-500 text-lg sm:text-xl font-normal mr-2">
                  ({totalItems} {totalItems === 1 ? 'منتج' : 'منتجات'})
                </span>
              )}
            </h1>
          </div>
          <p className="text-zinc-500 text-sm sm:text-base">
            المنتجات التي أعجبتك محفوظة هنا لتجدها بسهولة
          </p>
        </motion.div>

        {/* Empty State */}
        {state.items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-zinc-800/50"
          >
            <Heart className="w-20 h-20 mx-auto mb-6 text-zinc-700" />
            <h2 className="text-2xl font-amiri font-bold text-zinc-400 mb-3">المفضلة فارغة</h2>
            <p className="text-zinc-600 mb-8 max-w-md mx-auto">
              اضغط على أيقونة القلب ❤️ لأي منتج تعجبك لتجده هنا لاحقاً.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 gold-gradient rounded-xl text-zinc-950 font-bold text-lg luxury-shadow hover:scale-105 transition-transform"
            >
              <ShoppingBag className="w-5 h-5" />
              تصفح المنتجات
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Wishlist Items */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {itemsWithDetails.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-amber-500/20 transition-all group"
                  >
                    {/* Product Image */}
                    <Link to={`/product/${item.id}`} className="block relative">
                      <Image
                        src={item.product?.image || item.image || ''}
                        alt={item.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {item.product?.badge && (
                        <span className="absolute top-3 right-3 bg-amber-500 text-zinc-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow-lg">
                          {item.product.badge}
                        </span>
                      )}
                    </Link>

                    {/* Product Info */}
                    <div className="p-4">
                      <Link to={`/product/${item.id}`} className="hover:text-amber-400 transition-colors">
                        <h3 className="font-amiri font-bold text-white mb-1">{item.name}</h3>
                      </Link>
                      {item.product?.benefit && (
                        <span className="inline-block text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-lg font-bold mb-2">
                          {item.product.benefit}
                        </span>
                      )}
                      <p className="text-zinc-500 text-xs line-clamp-2 mb-4">
                        {item.product?.desc || item.name}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMoveToCart(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 py-2.5 rounded-xl text-xs font-bold transition-colors"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          للسلة
                        </button>
                        <a
                          href={getWhatsAppLink(`مرحباً، أريد الاستفسار عن ${item.name}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-xl text-xs font-bold transition-colors"
                        >
                          استفسار
                        </a>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2.5 bg-zinc-800 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded-xl transition-colors"
                          aria-label={`إزالة ${item.name} من المفضلة`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Clear Wishlist */}
              {state.items.length > 1 && (
                <button
                  onClick={() => state.items.forEach((item) => removeItem(item.id))}
                  className="mt-4 text-sm text-red-400/70 hover:text-red-400 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  إزالة الكل
                </button>
              )}
            </div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="bg-zinc-900/50 border border-amber-500/20 rounded-2xl p-6 sticky top-28">
                <h3 className="text-xl font-amiri font-bold text-white mb-6 pb-4 border-b border-zinc-800">
                  إجراءات سريعة
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={handleMoveAllToCart}
                    className="w-full flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 py-3.5 rounded-xl font-bold transition-colors luxury-shadow"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    نقل الكل للسلة
                  </button>

                  <Link
                    to="/shop"
                    className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 rounded-xl font-bold transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    تصفح المزيد
                  </Link>
                </div>

                {/* Info */}
                <div className="mt-6 pt-6 border-t border-zinc-800 space-y-3 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500">💡</span>
                    <span>انقل المنتجات للسلة لإتمام الطلب</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500">❤️</span>
                    <span>المفضلة محفوظة محلياً على جهازك</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500">🍯</span>
                    <span>عسل طبيعي 100% مفحوص مخبرياً</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};
