import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { UserPlus, Phone, MessageCircle, Facebook, Instagram, Globe, MapPin } from 'lucide-react';
import { Meta } from '../components/Meta';
import { CONTACTS } from '../data/contacts';
import { downloadVCard } from '../utils/vcard';
import { getTelLink } from '../config/site';

// تتبّع المسحات معطّل افتراضياً؛ عند التفعيل: فعّل سكربت التحليلات في index.html
// (GA4 أو Plausible) ثم اجعل العلم true ليُطلق حدث "scan" عند فتح الصفحة.
const ENABLE_ANALYTICS = false;

const isIOS = (): boolean =>
  typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

const linkClasses =
  'flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl bg-white border border-[#B8860B]/20 text-[#7C4A03] font-bold text-sm sm:text-base shadow-sm hover:border-[#B8860B]/50 hover:shadow-md transition-all';

export const ContactCardPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const contact = slug ? CONTACTS[slug] : undefined;

  React.useEffect(() => {
    if (!ENABLE_ANALYTICS || !contact) return;
    const gtag = (window as unknown as Record<string, unknown>).gtag;
    if (typeof gtag === 'function') {
      gtag('event', 'scan', { contact_slug: contact.slug });
    }
  }, [contact]);

  if (!contact) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#FFFDF5] font-cairo flex flex-col items-center justify-center px-6 text-center"
      >
        <Meta title="البطاقة غير موجودة | الهيثم نحل و عسل" noIndex />
        <span className="text-6xl mb-6">🐝</span>
        <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#7C4A03] mb-3">
          عذراً، هذه البطاقة غير موجودة
        </h1>
        <p className="text-[#7C4A03]/70 mb-8">تأكد من الرابط، أو تفضل بزيارة موقعنا الرئيسي.</p>
        <Link
          to="/"
          className="px-8 py-3 rounded-2xl bg-[#B8860B] text-white font-black hover:bg-[#7C4A03] transition-colors"
        >
          الانتقال إلى الموقع
        </Link>
      </div>
    );
  }

  const { social } = contact;
  const address = [contact.street, contact.city, contact.region].filter(Boolean).join('، ');

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#FFFDF5] font-cairo flex flex-col items-center px-4 py-10 sm:py-16"
    >
      <Meta
        title={`${contact.nameAr} | بطاقة التواصل`}
        description={contact.note}
        image={contact.logo}
      />

      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2rem] border border-[#B8860B]/15 shadow-[0_20px_60px_-20px_rgba(184,134,11,0.25)] overflow-hidden">
          {/* الترويسة */}
          <div className="bg-gradient-to-b from-[#B8860B]/10 to-transparent pt-10 pb-6 px-6 text-center">
            <img
              src={contact.logo}
              alt={contact.nameAr}
              width={112}
              height={112}
              className="w-28 h-28 rounded-full object-cover mx-auto mb-5 ring-4 ring-[#B8860B]/30 shadow-lg"
            />
            <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-[#7C4A03] mb-2">
              {contact.nameAr}
            </h1>
            <p className="text-[#7C4A03]/70 text-sm sm:text-base leading-relaxed">{contact.note}</p>
          </div>

          <div className="px-6 pb-8 space-y-3">
            {/* زر إضافة جهة الاتصال */}
            <button
              type="button"
              onClick={() => downloadVCard(contact)}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-[#B8860B] text-white font-black text-base sm:text-lg shadow-[0_10px_30px_-10px_rgba(184,134,11,0.6)] hover:bg-[#7C4A03] active:scale-[0.98] transition-all"
            >
              <UserPlus className="w-5 h-5" />
              أضف جهة الاتصال
            </button>

            {isIOS() && (
              <p className="text-center text-xs text-[#7C4A03]/60 leading-relaxed">
                اضغط الزر ثم اختر «إضافة جهة اتصال» من الشاشة التالية
              </p>
            )}

            <div className="pt-3 space-y-3">
              <a href={getTelLink()} className={linkClasses}>
                <Phone className="w-5 h-5 text-[#B8860B] shrink-0" />
                <span>
                  اتصال مباشر <span dir="ltr">{contact.phone}</span>
                </span>
              </a>

              {social.whatsapp && (
                <a
                  href={social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClasses}
                >
                  <MessageCircle className="w-5 h-5 text-[#25D366] shrink-0" />
                  <span>تواصل عبر واتساب</span>
                </a>
              )}

              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClasses}
                >
                  <Facebook className="w-5 h-5 text-[#1877F2] shrink-0" />
                  <span>صفحتنا على فيسبوك</span>
                </a>
              )}

              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClasses}
                >
                  <Instagram className="w-5 h-5 text-[#E1306C] shrink-0" />
                  <span>تابعنا على انستغرام</span>
                </a>
              )}

              <a href={contact.url} className={linkClasses}>
                <Globe className="w-5 h-5 text-[#B8860B] shrink-0" />
                <span>زيارة الموقع الإلكتروني</span>
              </a>
            </div>

            {address && (
              <div className="flex items-start gap-2 pt-4 text-xs sm:text-sm text-[#7C4A03]/60">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#B8860B]/60" />
                <span>{address}</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] sm:text-xs text-[#7C4A03]/40 mt-6">
          {contact.nameAr} — {contact.url.replace('https://', '')}
        </p>
      </div>
    </div>
  );
};
