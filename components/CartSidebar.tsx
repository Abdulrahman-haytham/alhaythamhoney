import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus, MessageCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { Link } from 'react-router-dom';
import { getWhatsAppLink } from '../config/site';
import { Image } from './Image';

export const CartSidebar: React.FC = () => {
  const { state, removeItem, updateQuantity, closeCart, clearCart, totalItems } = useCart();

  const handleWhatsAppOrder = () => {
    if (state.items.length === 0) return;
    const itemsList = state.items.map((item) => `- ${item.name} (الكمية: ${item.quantity})`).join('\n');
    const message = `مرحباً عسل الهيثم، أود طلب:\n${itemsList}`;
    window.open(getWhatsAppLink(message), '_blank', 'noopener noreferrer');
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
            onClick={closeCart}
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
                <ShoppingCart className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-zinc-100">
                  سلة الطلبات ({totalItems})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-zinc-500 hover:text-zinc-100 transition-colors"
                aria-label="إغلاق السلة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {state.items.length === 0 ? (
                <div className="text-center py-16 text-zinc-600">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">السلة فارغة</p>
                  <Link
                    to="/shop"
                    onClick={closeCart}
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
                      <Link to={`/product/${item.id}`} onClick={closeCart} className="flex-shrink-0">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.id}`} onClick={closeCart}>
                          <h3 className="font-bold text-zinc-100 truncate hover:text-amber-400 transition-colors">{item.name}</h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 bg-zinc-800 rounded hover:bg-zinc-700 text-zinc-400 transition-colors disabled:opacity-30"
                            disabled={item.quantity <= 1}
                            aria-label="إنقاص الكمية"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-zinc-100 font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 bg-zinc-800 rounded hover:bg-zinc-700 text-zinc-400 transition-colors"
                            aria-label="زيادة الكمية"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="mr-auto text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            إزالة
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {state.items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="w-full py-2 text-sm text-red-400/70 hover:text-red-400 transition-colors"
                    >
                      إفراغ السلة
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="p-4 border-t border-zinc-800 space-y-3">
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-3.5 rounded-xl font-bold transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  إرسال الطلب عبر واتساب
                </button>
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="block w-full text-center py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-bold transition-colors"
                >
                  عرض السلة الكاملة
                </Link>
                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="block w-full text-center py-2 text-amber-500 hover:text-amber-400 text-sm font-bold transition-colors"
                >
                  إضافة منتجات أخرى
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
