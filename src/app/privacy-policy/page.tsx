import type { Metadata } from 'next';
import { Shield } from 'lucide-react';
import { SITE, getWhatsAppLink } from '@/lib/config';
import { getSettings } from '@/lib/settings.server';
import { LegalPage, LegalSection } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية',
  description: 'كيف يجمع موقع الهيثم — نحل وعسل بياناتك ويستخدمها ويحميها، وما هي حقوقك تجاهها.',
  alternates: { canonical: '/privacy-policy' },
};

// الرقم وأجور الشحن تُقرأ من الإعدادات وقت الطلب (لا من ثوابت البناء)
export const dynamic = 'force-dynamic';

export default async function PrivacyPolicyPage() {
  await getSettings();
  return (
    <LegalPage
      icon={<Shield className="w-7 h-7 text-amber-500" strokeWidth={1.5} />}
      title="سياسة الخصوصية"
      intro="نحترم خصوصيتك ونجمع الحد الأدنى من البيانات اللازم لإتمام طلبك والتواصل معك."
      updatedAt="2026-09-08"
    >
      <LegalSection title="البيانات التي نجمعها">
        <p>عند إتمام طلب نطلب منك فقط ما يلزم لتوصيله:</p>
        <ul>
          <li>الاسم الكامل.</li>
          <li>رقم الهاتف للتواصل وتأكيد الطلب.</li>
          <li>العنوان والمحافظة لغرض الشحن.</li>
          <li>ملاحظات اختيارية تكتبها أنت.</li>
        </ul>
        <p>
          لا نطلب بيانات بطاقات بنكية، ولا توجد بوابة دفع إلكتروني على الموقع؛ الدفع يتم عند
          الاستلام أو بالاتفاق المباشر.
        </p>
      </LegalSection>

      <LegalSection title="ما يُحفظ داخل متصفحك">
        <p>
          سلة المشتريات وقائمة المفضلة تُحفظان محلياً في متصفحك فقط (
          <span dir="ltr">localStorage</span>)، ولا تُرسَل إلينا ما لم تُكمل طلباً. يمكنك مسحها في
          أي وقت بإفراغ السلة والمفضلة أو بحذف بيانات الموقع من إعدادات المتصفح.
        </p>
      </LegalSection>

      <LegalSection title="كيف نستخدم البيانات">
        <ul>
          <li>تجهيز الطلب وتوصيله وتتبّع حالته.</li>
          <li>التواصل معك لتأكيد التفاصيل أو حل مشكلة في الطلب.</li>
          <li>تحسين المنتجات والخدمة بناءً على ملاحظاتك.</li>
        </ul>
        <p>لا نبيع بياناتك ولا نؤجّرها ولا نشاركها لأغراض تسويقية مع أي طرف ثالث.</p>
      </LegalSection>

      <LegalSection title="مشاركة محدودة مع أطراف ثالثة">
        <p>
          نشارك اسمك ورقمك وعنوانك مع شركة الشحن بالقدر اللازم لتوصيل الطلب فقط. وقد تُحفظ سجلات
          تقنية عامة لدى مزوّد الاستضافة لأغراض الأمان والتشغيل.
        </p>
      </LegalSection>

      <LegalSection title="مدة الاحتفاظ">
        <p>
          نحتفظ ببيانات الطلب للمدة اللازمة لخدمة ما بعد البيع وحلّ أي نزاع محتمل، ثم تُحذف أو
          تُجهَّل هويتها.
        </p>
      </LegalSection>

      <LegalSection title="حقوقك">
        <p>
          يحق لك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها. راسلنا على{' '}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a> أو عبر{' '}
          <a
            href={getWhatsAppLink('مرحباً، لدي طلب بخصوص بياناتي الشخصية.')}
            target="_blank"
            rel="noopener noreferrer"
          >
            واتساب
          </a>{' '}
          وسنستجيب في أقرب وقت.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
