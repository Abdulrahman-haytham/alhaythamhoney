import type { Metadata } from 'next';
import { MessageCircle } from 'lucide-react';
import FAQ from '@/components/FAQ';
import { FAQ_ITEMS, faqPlainAnswer } from '@/lib/faq';
import { getWhatsAppLink } from '@/lib/config';
import { getSettings } from '@/lib/settings.server';

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة',
  description:
    'إجابات على الأسئلة الأكثر شيوعاً حول منتجات عسل الهيثم، الشحن داخل سوريا، تبلور العسل، وطرق الاستخدام والحفظ.',
  alternates: { canonical: '/faq' },
};

// الرقم وأجور الشحن تُقرأ من الإعدادات وقت الطلب (لا من ثوابت البناء)
export const dynamic = 'force-dynamic';

export default async function FAQPage() {
  await getSettings();
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: faqPlainAnswer(item) },
    })),
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-16 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* المكوّن يرسم عنوانه بنفسه؛ هنا يُرفع إلى h1 لأنه عنوان الصفحة */}
      <FAQ headingLevel="h1" />

      <section className="px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 p-8 text-center">
            <h2 className="mb-2 font-amiri text-2xl font-bold text-white">لم تجد جوابك؟</h2>
            <p className="mb-6 text-zinc-400">
              راسلنا مباشرة على واتساب ونجيبك بخبرة نحّال — عن المنتج، أو الخلطة المناسبة لك، أو
              الشحن.
            </p>
            <a
              href={getWhatsAppLink('مرحباً، لدي سؤال لم أجد جوابه في صفحة الأسئلة الشائعة.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 gold-gradient text-zinc-950 py-4 px-8 rounded-xl font-black luxury-shadow hover:scale-105 transition-transform"
            >
              <MessageCircle className="w-5 h-5" />
              اسألنا على واتساب
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
