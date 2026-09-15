'use client';

import Link from 'next/link';
import { Reveal } from '@/components/motion/Reveal';
import {
  FlaskConical,
  Hexagon,
  Award,
  Ban,
  HandCoins,
  Truck,
  MessageCircle,
  Store,
} from 'lucide-react';
import { SHIPPING, getWhatsAppLink } from '@/lib/config';
import { trackWhatsAppClick } from '@/lib/analytics';

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

/**
 * التزامات محدّدة بدل مقارنة «نحن مقابل الآخرون».
 * كل بند هنا واقعة قابلة للتحقق (رقم، مصدر، أو سياسة بيع فعلية) — لا ادعاء عام،
 * ولا تعريض بمنافسين مجهولين، لأن ذلك يُضعف ثقة الزائر بدل أن يبنيها.
 */
const COMMITMENTS = [
  {
    icon: FlaskConical,
    title: 'مفحوص قبل التعبئة',
    body: 'كل دفعة تمرّ بفحص مخبري للتأكد من نقائها قبل أن تصل إليك.',
  },
  {
    icon: Hexagon,
    title: 'من خليّتنا مباشرة',
    body: '400 خلية في مراعٍ سورية مختارة — بلا وسطاء ولا خلط.',
  },
  {
    icon: Award,
    title: 'إرث عائلي منذ 1997',
    body: 'أكثر من 25 عاماً في تربية النحل، بإدارة أبناء الوالد المؤسس.',
  },
  {
    icon: Ban,
    title: 'بلا أي إضافات',
    body: 'لا سكر، ولا مواد حافظة، ولا معالجة حرارية تُفقده خصائصه.',
  },
  {
    icon: HandCoins,
    title: 'الدفع عند الاستلام',
    body: 'لا تدفع شيئاً قبل أن يصلك الطلب وتطمئن إليه بنفسك.',
  },
  {
    icon: Truck,
    title: 'شحن لكل المحافظات',
    body: `توصيل آمن داخل سوريا، ومجاني للطلبات فوق ${fmt(SHIPPING.freeThreshold)} ل.س.`,
  },
];

export default function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 px-4 py-16 sm:px-6 sm:py-24 md:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-900/30 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-amber-500/[0.04] blur-3xl" />

      <div className="container relative mx-auto">
        <Reveal className="mb-12 text-center sm:mb-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/[0.07] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold tracking-wide text-amber-300">التزامنا</span>
          </div>
          <h2 className="mb-4 font-amiri text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            لماذا <span className="gold-text">الهيثم</span>؟
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            العسل الطبيعي لا يُثبَت بالكلام، بل بمصدره وفحصه وطريقة بيعه. هذه التزاماتنا الستة —
            مكتوبة لتُحاسبنا عليها.
          </p>
        </Reveal>

        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {COMMITMENTS.map((item, index) => (
            <Reveal
              delay={index * 0.06}
              key={item.title}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 transition-colors duration-300 hover:border-amber-500/40 hover:bg-zinc-900/70 sm:p-6"
            >
              <span className="absolute inset-x-0 top-0 mx-auto h-px w-0 bg-gradient-to-l from-transparent via-amber-400 to-transparent transition-all duration-500 group-hover:w-full" />

              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/[0.08] transition-colors duration-300 group-hover:border-amber-500/40 group-hover:bg-amber-500/15 sm:mb-4 sm:h-12 sm:w-12">
                <item.icon className="h-5 w-5 text-amber-400 sm:h-6 sm:w-6" strokeWidth={1.5} />
              </div>

              <h3 className="mb-1.5 text-sm font-bold leading-snug text-white sm:mb-2 sm:text-lg">
                {item.title}
              </h3>
              <p className="text-[11px] leading-relaxed text-zinc-400 sm:text-sm">{item.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex flex-col items-center justify-center gap-3 sm:mt-16 sm:flex-row sm:gap-4">
          <a
            href={getWhatsAppLink('مرحباً، أود الاستفسار عن منتجات الهيثم.')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick('why-choose-us')}
            className="inline-flex h-13 w-full items-center justify-center gap-2.5 rounded-xl bg-amber-500 px-8 py-4 font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition-colors hover:bg-amber-400 sm:w-auto"
          >
            <MessageCircle className="h-5 w-5" />
            تحدّث إلينا على واتساب
          </a>
          <Link
            href="/shop"
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-zinc-700 px-8 py-4 font-bold text-zinc-200 transition-colors hover:border-amber-500/40 hover:text-amber-300 sm:w-auto"
          >
            <Store className="h-5 w-5" />
            تصفّح المنتجات
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
