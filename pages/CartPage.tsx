import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, MessageCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { getWhatsAppLink } from '../config/site';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useProductGroups } from '../hooks/useProducts';
import { Meta } from '../components/Meta';
import { Image } from '../components/Image';

export const CartPage: React.FC = () => {
  const { state, removeItem, updateQuantity, clearCart, totalItems } = useCart();
  const { data: groups } = useProductGroups();

  const handleWhatsAppOrder = () => {
    if (state.items.length === 0) return;
    const itemsList = state.items.map((item) => `- ${item.name} (الكمية: ${item.quantity})`).join('\n');
    const message = `مرحباً عسل الهيثم، أود طلب:\n${itemsList}`;
    window.open(getWhatsAppLink(message), '_blank', 'noopener noreferrer');
  };

  // Find product details for each cart item
  const getCartItemsWithDetails = () => {
    const allProducts = (groups ?? []).flatMap((g) => g.items);
    return state.items.map((cartItem) => {
      const product = allProducts.find((p) => p.id === cartItem.id);
      return { ...cartItem, product };
    });
  };

  const itemsWithDetails = getCartItemsWithDetails();

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-16" dir="rtl">
      <Meta title="سلة الطلبات - الهيثم نحل و عسل" description="راجع طلباتك وأرسلها عبر واتساب لإتمام عملية الشراء." />

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs items={[{ label: 'سلة الطلبات' }]} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <ShoppingCart className="w-6 h-6 text-amber-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-amiri font-bold text-white">
              سلة الطلبات
              {totalItems > 0 && (
                <span className="text-zinc-500 text-lg sm:text-xl font-normal mr-2">
                  ({totalItems} {totalItems === 1 ? 'منتج' : 'منتجات'})
                </span>
              )}
            </h1>
          </div>
        </motion.div>

        {/* Empty State */}
        {state.items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-zinc-800/50"
          >
            <ShoppingCart className="w-20 h-20 mx-auto mb-6 text-zinc-700" />
            <h2 className="text-2xl font-amiri font-bold text-zinc-400 mb-3">السلة فارغة</h2>
            <p className="text-zinc-600 mb-8 max-w-md mx-auto">
              لم تضف أي منتجات بعد. تصفح متجرنا واختر أجود أنواع العسل الطبيعي.
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
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {itemsWithDetails.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 sm:p-6 hover:border-amber-500/20 transition-colors"
                >
                  <div className="flex gap-4">
                    <Link to={`/product/${item.id}`} className="flex-shrink-0">
                      <Image
                        src={item.product?.image || item.image || ''}
                        alt={item.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-zinc-800"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link to={`/product/${item.id}`} className="hover:text-amber-400 transition-colors">
                            <h3 className="text-lg font-amiri font-bold text-white">{item.name}</h3>
                          </Link>
                          {item.product?.benefit && (
                            <span className="inline-block text-xs bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-lg mt-1 font-bold">
                              {item.product.benefit}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                          aria-label={`إزالة ${item.name} من السلة`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-zinc-800/50 rounded-xl p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors disabled:opacity-30"
                            disabled={item.quantity <= 1}
                            aria-label="إنقاص الكمية"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center text-white font-bold text-lg">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
                            aria-label="زيادة الكمية"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Clear Cart */}
              <button
                onClick={clearCart}
                className="text-sm text-red-400/70 hover:text-red-400 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                إفراغ السلة
              </button>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="bg-zinc-900/50 border border-amber-500/20 rounded-2xl p-6 sticky top-28">
                <h3 className="text-xl font-amiri font-bold text-white mb-6 pb-4 border-b border-zinc-800">
                  ملخص الطلب
                </h3>

                <div className="space-y-3 mb-6">
                  {itemsWithDetails.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-zinc-400 truncate ml-2">{item.name} × {item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t border-zinc-800 pt-3">
                    <div className="flex justify-between text-zinc-300 font-bold">
                      <span>إجمالي المنتجات</span>
                      <span>{totalItems}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold text-lg transition-colors luxury-shadow"
                  >
                    <MessageCircle className="w-5 h-5" />
                    إرسال الطلب عبر واتساب
                  </button>

                  <Link
                    to="/shop"
                    className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 rounded-xl font-bold transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    إضافة منتجات أخرى
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-zinc-800 space-y-3 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500">🍯</span>
                    <span>عسل طبيعي 100% مفحوص مخبرياً</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500">🚚</span>
                    <span>شحن آمن لجميع المحافظات السورية</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500">✅</span>
                    <span>ضمان الجودة منذ 1997</span>
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
