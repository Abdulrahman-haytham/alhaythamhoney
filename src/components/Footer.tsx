import Link from 'next/link';
import { MessageCircle, Phone, Heart, MapPin } from 'lucide-react';
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '@/components/BrandIcons';
import { SITE, getTelLink, getWhatsAppLink, getRuntimeSettings } from '@/lib/config';
import { getSiteContentFlags } from '@/lib/content.server';

/** تذييل الموقع — مكوّن خادم بلا تفاعلية، يعتمد فقط على ثوابت SITE. */
export default async function Footer() {
  const phoneNumber = SITE.phoneNumber;
  const { wholesaleEnabled } = getRuntimeSettings();
  const { hasStudioPhotos } = await getSiteContentFlags();
  const facebookLink = SITE.social.facebook;
  const instagramLink = SITE.social.instagram;

  return (
    <footer className="bg-zinc-950 pt-12 sm:pt-20 md:pt-24 pb-8 sm:pb-12 border-t border-amber-900/10 px-4 sm:px-6">
      <div className="container mx-auto">
        {/* الخاتمة البيعية – القرار الهادئ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 md:gap-12 mb-10 sm:mb-14 md:mb-20 items-center text-right">
          <div>
            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-amiri font-black mb-5 sm:mb-7 text-white leading-tight px-1 sm:px-2">
              الهيثم… لسنا مجرد متجر. <br />
              <span className="text-amber-500">نحن عائلة تتقن فن تربية النحل.</span>
            </h2>
            <div className="space-y-2.5 sm:space-y-4 text-zinc-400 text-sm sm:text-lg md:text-xl font-light mb-6 sm:mb-9 leading-relaxed">
              <p>عسل طبيعي يصلك بنفس الجودة التي خرج بها من المنحل.</p>
              <p className="flex items-center gap-2 sm:gap-3 text-amber-500 font-bold text-sm sm:text-base md:text-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                شحن سريع وآمن لكافة المحافظات السورية.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 sm:gap-3 bg-amber-500 text-zinc-950 px-5 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-full font-black text-sm sm:text-base md:text-lg shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105 transition-all"
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                اطلب الآن عبر واتساب
              </a>
              {/* حساباتنا — بشعاراتها المعروفة لا بكرة أرضية لا تدلّ على شيء */}
              <div className="flex items-center justify-center gap-2 rounded-full border border-white/5 bg-zinc-900/50 px-3 py-2 sm:gap-3 sm:px-4">
                {facebookLink && (
                  <a
                    href={facebookLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="صفحتنا على فيسبوك"
                    className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-[#1877F2]"
                  >
                    <FacebookIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </a>
                )}
                {instagramLink && (
                  <a
                    href={instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="حسابنا على إنستغرام"
                    className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-[#E1306C]"
                  >
                    <InstagramIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </a>
                )}
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="راسلنا على واتساب"
                  className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-[#25D366]"
                >
                  <WhatsAppIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </a>
                <a
                  href={getTelLink()}
                  aria-label="اتصل بنا"
                  className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-amber-500"
                >
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative text-center">
            <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full"></div>
            <img
              src="/images/story.webp"
              alt="الأخوان مؤسسا الهيثم بين خلايا النحل في المنحل"
              loading="lazy"
              className="relative w-full max-w-xs mx-auto object-contain brightness-110 drop-shadow-[0_0_18px_rgba(212,175,55,0.18)] rounded-2xl"
            />
          </div>
        </div>

        {/* الفوتر - تثبيت العلامة */}
        <div className="pt-12 sm:pt-16 md:pt-20 border-t border-zinc-900 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 text-zinc-500 text-xs sm:text-sm text-right">
          <div className="col-span-1 sm:col-span-2 md:col-span-1 flex flex-col items-start md:items-end">
            <img
              src="/images/logo.webp"
              alt="شعار الهيثم — نحل وعسل"
              loading="lazy"
              className="h-12 sm:h-14 md:h-16 mb-3 sm:mb-4 brightness-110 rounded-lg"
            />
            <h3 className="text-xl sm:text-2xl font-amiri font-bold text-amber-500 mb-3 sm:mb-4">
              الهيثم — نحل وعسل
            </h3>
            <p className="leading-relaxed text-xs sm:text-sm">
              منذ {SITE.foundedYear} ونحن نضع اسمنا ضماناً لكل قطرة عسل. إرث الوالد المؤسس يحيى في
              كل خلية.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">
              المحاصيل والمنتجات
            </h4>
            <ul className="space-y-2 sm:space-y-3 md:space-y-4 text-xs sm:text-sm">
              <li>
                <Link
                  href="/product/black-seed-honey"
                  className="hover:text-amber-500 transition-colors"
                >
                  عسل حبة البركة
                </Link>
              </li>
              <li>
                <Link
                  href="/product/dardar-honey"
                  className="hover:text-amber-500 transition-colors"
                >
                  عسل الدردار
                </Link>
              </li>
              <li>
                <Link
                  href="/product/jejan-honey"
                  className="hover:text-amber-500 transition-colors"
                >
                  عسل الجيجان
                </Link>
              </li>
              <li>
                <Link href="/custom-mixtures" className="hover:text-amber-500 transition-colors">
                  الخلطات الخاصة
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">روابط سريعة</h4>
            <ul className="space-y-2 sm:space-y-3 md:space-y-4 text-xs sm:text-sm">
              <li>
                <Link href="/shop" className="hover:text-amber-500 transition-colors">
                  المتجر
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-amber-500 transition-colors">
                  قصتنا
                </Link>
              </li>
              <li>
                <Link href="/quality-standards" className="hover:text-amber-500 transition-colors">
                  معايير الجودة
                </Link>
              </li>
              {hasStudioPhotos && (
                <li>
                  <Link href="/studio" className="hover:text-amber-500 transition-colors">
                    استديو الهيثم
                  </Link>
                </li>
              )}
              <li>
                <Link href="/articles" className="hover:text-amber-500 transition-colors">
                  المدونة
                </Link>
              </li>
              <li>
                <Link href="/beekeeping" className="hover:text-amber-500 transition-colors">
                  موسوعة النحّال
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-amber-500 transition-colors">
                  الأسئلة الشائعة
                </Link>
              </li>
              {wholesaleEnabled && (
                <li>
                  <Link href="/wholesale" className="hover:text-amber-500 transition-colors">
                    الجملة والمحلات
                  </Link>
                </li>
              )}
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
                <a href={getTelLink()} className="hover:text-amber-500 transition-colors" dir="ltr">
                  {phoneNumber}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-amber-500" />
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-500 transition-colors"
                >
                  تواصل عبر واتساب
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 md:mt-20 pt-8 sm:pt-10 md:pt-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 text-zinc-600 text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest font-bold">
          <p>© 2026 الهيثم — نحل وعسل. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-2">
            صُنع بكل حب في <span className="text-zinc-400">سوريا</span>
            <Heart className="w-3 h-3 text-red-900 fill-red-900" />
          </p>
        </div>
      </div>
    </footer>
  );
}
