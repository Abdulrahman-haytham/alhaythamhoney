import type { Metadata } from 'next';
import { Scale } from 'lucide-react';
import { SHIPPING, SITE, getWhatsAppLink } from '@/lib/config';
import { LegalPage, LegalSection } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'الشروط والأحكام',
  description:
    'الشروط المنظّمة لاستخدام موقع الهيثم لنحل وعسل وللطلب والشحن والدفع داخل سوريا.',
  alternates: { canonical: '/terms' },
};

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

export default function TermsPage() {
  return (
    <LegalPage
      icon={<Scale className="w-7 h-7 text-amber-500" strokeWidth={1.5} />}
      title="الشروط والأحكام"
      intro="باستخدامك للموقع وتقديم طلب فإنك توافق على الشروط التالية."
      updatedAt="2026-09-08"
    >
      <LegalSection title="عن المنتجات">
        <p>
          نبيع عسلاً طبيعياً ومنتجات نحل. الصور توضيحية، وقد يختلف لون العسل وقوامه ودرجة تبلوره
          باختلاف الموسم والمرعى — وهذا من طبيعة المنتج ولا يُعدّ عيباً.
        </p>
        <p>
          المعلومات الواردة في المدونة تثقيفية عامة ولا تُغني عن استشارة الطبيب، ولا تُقدَّم على
          أنها تشخيص أو علاج.
        </p>
      </LegalSection>

      <LegalSection title="الطلب والتأكيد">
        <ul>
          <li>يُسجَّل الطلب من الموقع أو عبر واتساب أو الهاتف.</li>
          <li>يصبح الطلب نافذاً بعد تأكيده هاتفياً معك.</li>
          <li>نحتفظ بحق رفض أو إلغاء أي طلب عند نفاد المخزون أو وجود بيانات غير صحيحة.</li>
          <li>الأسعار بالليرة السورية وقابلة للتغيير دون إشعار مسبق قبل تأكيد الطلب.</li>
        </ul>
      </LegalSection>

      <LegalSection title="الشحن والدفع">
        <ul>
          <li>نشحن إلى جميع المحافظات السورية.</li>
          <li>
            أجور الشحن {fmt(SHIPPING.cost)} ل.س، وتصبح مجانية للطلبات التي تتجاوز{' '}
            {fmt(SHIPPING.freeThreshold)} ل.س.
          </li>
          <li>الدفع عند الاستلام أو بالاتفاق المباشر؛ لا توجد بوابة دفع إلكتروني على الموقع.</li>
          <li>مدة التوصيل تقديرية وقد تتأثر بظروف النقل خارج سيطرتنا.</li>
        </ul>
      </LegalSection>

      <LegalSection title="الاسترجاع">
        <p>
          يخضع الاسترجاع والاستبدال لما هو موضّح في <a href="/return-policy">سياسة الاسترجاع</a>،
          وهي جزء لا يتجزأ من هذه الشروط.
        </p>
      </LegalSection>

      <LegalSection title="استخدام الموقع والملكية الفكرية">
        <p>
          جميع النصوص والصور والتصاميم المنشورة على الموقع مملوكة لـ{SITE.name}. لا يجوز إعادة
          نشرها أو استخدامها تجارياً دون إذن خطي مسبق.
        </p>
        <p>
          يُمنع استخدام الموقع بأي شكل يضر بعمله أو بأمنه أو ينتهك القوانين النافذة.
        </p>
      </LegalSection>

      <LegalSection title="حدود المسؤولية">
        <p>
          نبذل جهدنا لدقة المعلومات المعروضة، لكننا لا نضمن خلوّها من الأخطاء المطبعية. مسؤوليتنا
          في جميع الأحوال محدودة بقيمة الطلب المدفوعة.
        </p>
      </LegalSection>

      <LegalSection title="القانون الواجب التطبيق والتواصل">
        <p>
          تخضع هذه الشروط للقوانين النافذة في الجمهورية العربية السورية. لأي استفسار راسلنا على{' '}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a> أو عبر{' '}
          <a href={getWhatsAppLink('مرحباً، لدي استفسار عن الشروط والأحكام.')} target="_blank" rel="noopener noreferrer">
            واتساب
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}