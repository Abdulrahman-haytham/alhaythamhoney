
import React from 'react';
import { MessageCircle, Instagram, Facebook, Phone, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const phoneNumber = "963930112994";
  const facebookLink = "https://www.facebook.com/profile.php?id=100064934053886";

  return (
    <footer className="bg-zinc-950 pt-32 pb-12 border-t border-amber-900/10 px-6">
      <div className="container mx-auto">
        {/* 8. الخاتمة البيعية – القرار الهادئ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-center text-right">
          <div>
            <h2 className="text-4xl md:text-5xl font-amiri font-bold mb-8 text-white leading-tight">
              الهيثم… لسنا مجرد متجر. <br />
              <span className="gold-text">نحن عائلة تتقن فن تربية النحل.</span>
            </h2>
            <div className="space-y-4 text-zinc-400 text-xl font-light mb-10 leading-relaxed">
              <p>عسل طبيعي يصلك بنفس الجودة التي خرج بها من المنحل.</p>
              <p className="flex items-center gap-3 text-amber-500 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                شحن سريع وآمن لكافة المحافظات السورية.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <a 
                href={`https://wa.me/${phoneNumber}`} 
                className="flex items-center justify-center gap-4 bg-amber-500 text-zinc-950 px-12 py-5 rounded-full font-black text-xl luxury-shadow hover:scale-105 transition-all"
              >
                🍯 اطلب الآن عبر واتساب
              </a>
              <div className="flex items-center justify-center gap-6 px-8 py-5 bg-zinc-900/50 rounded-full border border-white/5">
                <a href="#" className="text-zinc-400 hover:text-amber-500 transition-colors"><Instagram className="w-6 h-6" /></a>
                <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-amber-500 transition-colors"><Facebook className="w-6 h-6" /></a>
                <a href={`tel:+${phoneNumber}`} className="text-zinc-400 hover:text-amber-500 transition-colors"><Phone className="w-6 h-6" /></a>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative text-center">
            <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full"></div>
            <img 
              src="logo.png" 
              alt="Golden Honey Legacy" 
              className="relative w-full max-w-sm mx-auto object-contain brightness-110 drop-shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            />
          </div>
        </div>
        
        {/* 9. الفوتر - تثبيت العلامة */}
        <div className="pt-20 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-4 gap-12 text-zinc-500 text-sm text-right">
          <div className="col-span-1 md:col-span-1 flex flex-col items-start md:items-end">
             <img src="https://res.cloudinary.com/dkbvnupge/image/upload/v1767958674/my-app-uploads/kromozksoa3vpcwrnvtw.jpg" alt="Logo" className="h-16 mb-4 brightness-110" />
             <h3 className="text-2xl font-amiri font-bold gold-text mb-4">الهيثم لنحل وعسل</h3>
             <p className="leading-relaxed">منذ 1997 ونحن نضع اسمنا ضماناً لكل قطرة عسل. إرث الوالد المؤسس يحيى في كل خلية.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">المحاصيل والمنتجات</h4>
            <ul className="space-y-4">
              <li><a href="#products" className="hover:text-amber-500 transition-colors">عسل حبة البركة</a></li>
              <li><a href="#products" className="hover:text-amber-500 transition-colors">عسل الدردار</a></li>
              <li><a href="#products" className="hover:text-amber-500 transition-colors">عسل الجيجان</a></li>
              <li><a href="#products" className="hover:text-amber-500 transition-colors">المكملات الحيوية</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">المختبر والمنحل</h4>
            <ul className="space-y-4">
              <li><a href="#products" className="hover:text-amber-500 transition-colors">المختبر الملكي</a></li>
              <li><a href="#quality" className="hover:text-amber-500 transition-colors">الفحص المخبري</a></li>
              <li><a href="#story" className="hover:text-amber-500 transition-colors">عن الهيثم</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">خدمة العملاء</h4>
            <ul className="space-y-4">
              <li>واتساب: +963 930 112 994</li>
              <li>الموقع: سوريا - كافة المحافظات</li>
              <li>دعم فني واستشارات صحية</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-20 pt-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-600 text-[10px] uppercase tracking-widest font-bold">
          <p>© 2026 الهيثم لنحل وعسل. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-2">
            صُنع بكل حب في <span className="text-zinc-400">سوريا 🇸🇾</span>
            <Heart className="w-3 h-3 text-red-900 fill-red-900" />
          </p>
        </div>
      </div>
    </footer>
  );
};
