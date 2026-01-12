
import React from 'react';
import { ShieldCheck, Award, Truck } from 'lucide-react';

export const Header: React.FC = () => {
  const phoneNumber = "963930112994";
  
  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Top Excellence Bar */}
      <div className="bg-black border-b border-amber-900/30 py-2 px-4 text-[10px] md:text-sm font-light tracking-wide">
        <div className="container mx-auto flex flex-col md:flex-row justify-center items-center gap-2 md:gap-8 text-amber-200/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>طبيعي 100% ومفحوص مخبرياً</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-amber-900/50"></div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>خبرة عائلية +25 عاماً</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-amber-900/50"></div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-500" />
            <span>شحن آمن لكافة المحافظات السورية</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-zinc-950/80 backdrop-blur-md border-b border-amber-900/20 py-2 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              src="https://res.cloudinary.com/dkbvnupge/image/upload/v1767958674/my-app-uploads/kromozksoa3vpcwrnvtw.jpg" 
              alt="لوغو الهيثم" 
              className="h-12 md:h-16 w-auto object-contain brightness-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]"
            />
            <div className="flex flex-col border-r border-zinc-800 pr-4 mr-2">
              <span className="text-xl md:text-2xl font-amiri font-bold gold-text leading-tight">الهيثم</span>
              <span className="text-[10px] text-zinc-500 tracking-[0.2em] uppercase font-bold">لنحل وعسل</span>
            </div>
          </div>
          
          <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
            <a href="#products" className="hover:text-amber-500 transition-colors">المحاصيل</a>
            <a href="#story" className="hover:text-amber-500 transition-colors">حكايتنا</a>
            <a href="#quality" className="hover:text-amber-500 transition-colors">الجودة</a>
          </div>

          <a 
            href={`https://wa.me/${phoneNumber}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-2 gold-gradient rounded-full text-zinc-950 text-sm font-black luxury-shadow hover:scale-105 transition-transform"
          >
            اطلب الآن
          </a>
        </div>
      </nav>
    </header>
  );
};