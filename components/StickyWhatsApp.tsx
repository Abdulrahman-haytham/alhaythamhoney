import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

export const StickyWhatsApp: React.FC = () => {
  const phoneNumber = "963947931959";
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white text-zinc-900 px-4 py-2 rounded-xl shadow-xl mb-2 text-sm font-bold whitespace-nowrap relative"
              >
                تواصل معنا مباشرة عبر واتساب
                <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white transform rotate-45"></div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <a
            href={`https://wa.me/${phoneNumber}?text=مرحباً، أود الاستفسار عن منتجات الهيثم`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-[#25D366]/40 hover:scale-110 transition-all duration-300 relative group"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, repeatDelay: 2 }}
            >
              <MessageCircle className="w-8 h-8" />
            </motion.div>
            
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-20"></div>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
};