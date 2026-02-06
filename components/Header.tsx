
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Award, Truck, Store, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const phoneNumber = "+963947931959";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      // إذا كنا في الصفحة الرئيسية، ننتقل إلى الأعلى
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // إذا كنا في صفحة أخرى، نذهب إلى الصفحة الرئيسية
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  
  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Top Excellence Bar */}
      <div className="bg-black border-b border-amber-900/30 py-1.5 sm:py-2 px-3 sm:px-4 text-[10px] sm:text-xs md:text-sm font-light tracking-wide">
        <div className="container mx-auto flex flex-col md:flex-row justify-center items-center gap-1.5 sm:gap-2 md:gap-8 text-amber-200/80">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
            <span>طبيعي 100% ومفحوص مخبرياً</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-amber-900/50"></div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
            <span>خبرة عائلية +25 عاماً</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-amber-900/50"></div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
            <span className="hidden sm:inline">شحن آمن لكافة المحافظات السورية</span>
            <span className="sm:hidden">شحن آمن</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-zinc-950/80 backdrop-blur-md border-b border-amber-900/20 py-1.5 sm:py-2 px-3 sm:px-4 md:px-6">
        <div className="container mx-auto flex justify-between items-center">
          <a 
            href="/" 
            onClick={handleLogoClick}
            className="flex items-center gap-2 sm:gap-3 md:gap-4 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img 
              src="https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1767958674/my-app-uploads/kromozksoa3vpcwrnvtw.jpg" 
              alt="لوغو الهيثم" 
              width="64"
              height="64"
              className="h-10 sm:h-12 md:h-16 w-auto object-contain brightness-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]"
            />
            <div className="flex flex-col border-r border-zinc-800 pr-2 sm:pr-3 md:pr-4 mr-1 sm:mr-2">
              <span className="text-lg sm:text-xl md:text-2xl font-amiri font-bold gold-text leading-tight">الهيثم</span>
              <span className="text-[8px] sm:text-[9px] md:text-[10px] text-zinc-500 tracking-[0.15em] sm:tracking-[0.2em] uppercase font-bold">لنحل وعسل</span>
            </div>
          </a>
          
          <div className="hidden md:flex gap-6 lg:gap-8 text-sm font-medium text-zinc-400">
            <Link to="/shop" className="flex items-center gap-2 hover:text-amber-500 transition-colors">
              <Store className="w-4 h-4" />
              المتجر
            </Link>
            <Link to="/articles" className="hover:text-amber-500 transition-colors">المدونة</Link>
            <Link to="/custom-mixtures" className="hover:text-amber-500 transition-colors">الخلطات الخاصة</Link>
            <Link to="/about-us" className="hover:text-amber-500 transition-colors">قصتنا</Link>
            <Link to="/quality-standards" className="hover:text-amber-500 transition-colors">الجودة</Link>
            <Link to="/faq" className="hover:text-amber-500 transition-colors">الأسئلة الشائعة</Link>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href={`https://wa.me/${phoneNumber.replace(/\D/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden md:block px-4 lg:px-6 py-1.5 lg:py-2 gold-gradient rounded-full text-zinc-950 text-xs lg:text-sm font-black luxury-shadow hover:scale-105 transition-transform"
            >
              اطلب الآن
            </a>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 text-zinc-400 hover:text-amber-500 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-zinc-950/95 backdrop-blur-md border-b border-amber-900/20 h-screen overflow-y-auto pb-20">
              <div className="flex flex-col py-6 px-6 gap-6">
                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                >
                  <Store className="w-6 h-6 text-amber-500" />
                  <span className="font-medium">المتجر</span>
                </Link>
                <Link
                  to="/articles"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                >
                  المدونة
                </Link>
                <Link
                  to="/custom-mixtures"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                >
                  الخلطات الخاصة
                </Link>
                <Link
                  to="/about-us"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                >
                  حكايتنا
                </Link>
                <Link
                  to="/quality-standards"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                >
                  الجودة
                </Link>
                <Link
                  to="/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-zinc-300 hover:text-amber-500 transition-colors py-3 text-lg border-b border-zinc-800/50"
                >
                  الأسئلة الشائعة
                </Link>
                <a
                  href={`https://wa.me/${phoneNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-4 w-full py-4 gold-gradient rounded-xl text-zinc-950 text-lg font-black text-center luxury-shadow active:scale-95 transition-transform"
                >
                  اطلب الآن
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
