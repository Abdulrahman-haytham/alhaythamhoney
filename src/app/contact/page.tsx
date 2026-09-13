import type { Metadata } from 'next';
import { Phone, MessageCircle, Mail, MapPin, Clock, Globe } from 'lucide-react';
import { SITE, getWhatsAppLink, getTelLink } from '@/lib/config';
import { getSettings } from '@/lib/settings.server';

export const metadata: Metadata = {
  title: 'تواصل معنا',
  description:
    'تواصل مع الهيثم — نحل وعسل عبر واتساب أو الهاتف أو البريد. الحي الشمالي، قمحانة، حماة، سوريا.',
  alternates: { canonical: '/contact' },
};

const channels = [
  {
    icon: MessageCircle,
    label: 'واتساب',
    value: SITE.phoneNumber,
    href: getWhatsAppLink(SITE.whatsappDefaultMessage),
    external: true,
    note: 'أسرع وسيلة للرد وتأكيد الطلبات',
  },
  {
    icon: Phone,
    label: 'الهاتف',
    value: SITE.phoneNumber,
    href: getTelLink(),
    external: false,
    note: SITE.workingHours,
  },
  {
    icon: Mail,
    label: 'البريد الإلكتروني',
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    external: false,
    note: 'للاستفسارات وطلبات الجملة',
  },
];

// الرقم وأجور الشحن تُقرأ من الإعدادات وقت الطلب (لا من ثوابت البناء)
export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  await getSettings();
  return (
    <section className="min-h-screen pt-32 pb-16 px-4 sm:px-6 bg-zinc-950">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-amiri font-bold text-white mb-4">
            تواصل معنا
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            نسعد بأسئلتكم عن المنتجات والخلطات الخاصة وطلبات الجملة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {channels.map(({ icon: Icon, label, value, href, external, note }) => (
            <a
              key={label}
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="group bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-6 transition-all luxury-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                <Icon className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">{label}</h2>
              <p className="text-amber-500 text-sm mb-2 dir-ltr text-right" dir="ltr">
                {value}
              </p>
              <p className="text-zinc-500 text-xs leading-relaxed">{note}</p>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-white">العنوان</h2>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              الحي الشمالي، جانب مسجد بلال الحبشي
              <br />
              قمحانة، حماة، سوريا
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-white">ساعات العمل</h2>
            </div>
            <p className="text-zinc-300 leading-relaxed">{SITE.workingHours}</p>
            {SITE.social.facebook && (
              <a
                href={SITE.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm text-zinc-400 hover:text-amber-500 transition-colors"
              >
                <Globe className="w-4 h-4" />
                صفحتنا على فيسبوك
              </a>
            )}
          </div>
        </div>

        <div className="mt-10 text-center">
          <a
            href={getWhatsAppLink(SITE.whatsappDefaultMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 gold-gradient text-zinc-950 py-4 px-8 rounded-xl font-black luxury-shadow hover:scale-105 transition-transform"
          >
            <MessageCircle className="w-5 h-5" />
            راسلنا على واتساب
          </a>
        </div>
      </div>
    </section>
  );
}
