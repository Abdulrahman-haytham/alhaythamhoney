
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Instagram, Facebook, Phone, Heart, MapPin, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const phoneNumber = "+963947931959";
  const facebookLink = "https://www.facebook.com/profile.php?id=100064934053886";

  return (
    <footer className="bg-zinc-950 pt-16 sm:pt-24 md:pt-32 pb-8 sm:pb-12 border-t border-amber-900/10 px-4 sm:px-6">
      <div className="container mx-auto">
        {/* 8. الخاتمة البيعية – القرار الهادئ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 mb-12 sm:mb-16 md:mb-24 items-center text-right">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-amiri font-bold mb-6 sm:mb-8 text-white leading-tight px-2">
              الهيثم… لسنا مجرد متجر. <br />
              <span className="text-amber-500">نحن عائلة تتقن فن تربية النحل.</span>
            </h2>
            <div className="space-y-3 sm:space-y-4 text-zinc-400 text-base sm:text-lg md:text-xl font-light mb-8 sm:mb-10 leading-relaxed">
              <p>عسل طبيعي يصلك بنفس الجودة التي خرج بها من المنحل.</p>
              <p className="flex items-center gap-2 sm:gap-3 text-amber-500 font-bold text-sm sm:text-base md:text-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                شحن سريع وآمن لكافة المحافظات السورية.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <a 
                href={`https://wa.me/${phoneNumber.replace(/\D/g, '')}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 sm:gap-4 bg-amber-500 text-zinc-950 px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 rounded-full font-black text-sm sm:text-base md:text-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105 transition-all"
              >
                <MessageCircle className="w-6 h-6" />
                اطلب الآن عبر واتساب
              </a>
              <div className="flex items-center justify-center gap-4 sm:gap-6 px-6 sm:px-8 py-4 sm:py-5 bg-zinc-900/50 rounded-full border border-white/5">
                <a href="#" className="text-zinc-400 hover:text-amber-500 transition-colors"><Instagram className="w-5 h-5 sm:w-6 sm:h-6" /></a>
                <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-amber-500 transition-colors"><Facebook className="w-5 h-5 sm:w-6 sm:h-6" /></a>
                <a href={`tel:${phoneNumber}`} className="text-zinc-400 hover:text-amber-500 transition-colors"><Phone className="w-5 h-5 sm:w-6 sm:h-6" /></a>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative text-center">
            <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full"></div>
            <img 
              src="https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1767958674/my-app-uploads/kromozksoa3vpcwrnvtw.jpg" 
              alt="Golden Honey Legacy" 
              className="relative w-full max-w-sm mx-auto object-contain brightness-110 drop-shadow-[0_0_20px_rgba(212,175,55,0.2)] rounded-2xl"
            />
          </div>
        </div>
        
        {/* 9. الفوتر - تثبيت العلامة */}
        <div className="pt-12 sm:pt-16 md:pt-20 border-t border-zinc-900 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 text-zinc-500 text-xs sm:text-sm text-right">
          <div className="col-span-1 sm:col-span-2 md:col-span-1 flex flex-col items-start md:items-end">
             <img 
               src="https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1767958674/my-app-uploads/kromozksoa3vpcwrnvtw.jpg" 
               alt="Logo" 
               loading="lazy"
               className="h-12 sm:h-14 md:h-16 mb-3 sm:mb-4 brightness-110 rounded-lg" 
             />
             <h3 className="text-xl sm:text-2xl font-amiri font-bold text-amber-500 mb-3 sm:mb-4">الهيثم لنحل وعسل</h3>
             <p className="leading-relaxed text-xs sm:text-sm">منذ 1997 ونحن نضع اسمنا ضماناً لكل قطرة عسل. إرث الوالد المؤسس يحيى في كل خلية.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">المحاصيل والمنتجات</h4>
            <ul className="space-y-2 sm:space-y-3 md:space-y-4 text-xs sm:text-sm">
              <li><Link to="/product/black-seed-honey" className="hover:text-amber-500 transition-colors">عسل حبة البركة</Link></li>
              <li><Link to="/product/dardar-honey" className="hover:text-amber-500 transition-colors">عسل الدردار</Link></li>
              <li><Link to="/product/jejan-honey" className="hover:text-amber-500 transition-colors">عسل الجيجان</Link></li>
              <li><Link to="/custom-mixtures" className="hover:text-amber-500 transition-colors">الخلطات الخاصة</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">روابط سريعة</h4>
            <ul className="space-y-2 sm:space-y-3 md:space-y-4 text-xs sm:text-sm">
              <li><Link to="/shop" className="hover:text-amber-500 transition-colors">المتجر</Link></li>
              <li><Link to="/about-us" className="hover:text-amber-500 transition-colors">قصتنا</Link></li>
              <li><Link to="/quality-standards" className="hover:text-amber-500 transition-colors">معايير الجودة</Link></li>
              <li><Link to="/articles" className="hover:text-amber-500 transition-colors">المدونة</Link></li>
              <li><Link to="/faq" className="hover:text-amber-500 transition-colors">الأسئلة الشائعة</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">تواصل معنا</h4>
            <ul className="space-y-2 sm:space-y-3 md:space-y-4 text-xs sm:text-sm">
              <li className="flex items-center gap-2 text-zinc-400">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>سوريا - كافة المحافظات</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                <a href={`tel:${phoneNumber}`} className="hover:text-amber-500 transition-colors" dir="ltr">{phoneNumber}</a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-amber-500" />
                <a href={`https://wa.me/${phoneNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">تواصل عبر واتساب</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 sm:mt-16 md:mt-20 pt-8 sm:pt-10 md:pt-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 text-zinc-600 text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest font-bold">
          <p>© 2026 الهيثم لنحل وعسل. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-2">
            صُنع بكل حب في <span className="text-zinc-400">سوريا</span>
            <Heart className="w-3 h-3 text-red-900 fill-red-900" />
          </p>
        </div>
      </div>
    </footer>
  );
};
