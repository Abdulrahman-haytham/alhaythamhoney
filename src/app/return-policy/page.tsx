import type { Metadata } from 'next';
import { RotateCcw, CheckCircle2, XCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { SHIPPING, SITE, getWhatsAppLink } from '@/lib/config';
import { LegalPage, LegalSection } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'سياسة الاسترجاع',
  description:
    'نضمن لك جودة منتجاتنا 100%. تعرف على ضمان الجودة وسياسة الاسترجاع والاستبدال في الهيثم — نحل وعسل.',
  alternates: { canonical: '/return-policy' },
};

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

type Tone = 'ok' | 'warn' | 'no' | 'dot';

const ICONS: Record<Tone, React.ReactNode> = {
  ok: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  warn: <CheckCircle2 className="w-4 h-4 text-amber-500" />,
  no: <XCircle className="w-4 h-4 text-red-500/60" />,
  dot: <span className="block w-1.5 h-1.5 rounded-full bg-amber-500" />,
};

/** قائمة برموز دلالية (صح/خطأ/نقطة) بدل النقاط العادية — كما في الصفحة الأصلية. */
function PolicyList({ tone, items }: { tone: Tone; items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((text, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-1.5 shrink-0 flex items-center">{ICONS[tone]}</span>
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ReturnPolicyPage() {
  return (
    <LegalPage
      icon={<RotateCcw className="w-7 h-7 text-amber-500" strokeWidth={1.5} />}
      title="ضمان الجودة وسياسة الاسترجاع"
      intro="نلتزم في مناحل الهيثم بتقديم منتجات نحل طبيعية وعالية الجودة، لضمان رضاكم التام."
      updatedAt="2026-09-12"
    >
      <LegalSection title="أولًا – ضمان الالتزام بالجودة">
        <PolicyList
          tone="ok"
          items={[
            'نضمن مطابقة المنتج للمواصفات الطبيعية المعتمدة لدينا.',
            'أي خلل في الجودة يُعتبر مسؤوليتنا المباشرة.',
          ]}
        />
      </LegalSection>

      <LegalSection title="ثانيًا – حالات الاسترجاع أو الاستبدال">
        <PolicyList
          tone="warn"
          items={[
            'في حال ثبوت عدم الالتزام بمعايير الجودة المتّفق عليها.',
            'وجود تلف أو كسر في العبوة عند الاستلام.',
            'وصول منتج مختلف عن الطلب.',
          ]}
        />
      </LegalSection>

      <LegalSection title="ثالثًا – شروط الاسترجاع">
        <PolicyList
          tone="dot"
          items={[
            'الإبلاغ خلال 24 ساعة من الاستلام.',
            'أن تكون العبوة غير مفتوحة، إلا في حال اكتشاف خلل.',
            'إرفاق صورة أو فيديو يوضّح المشكلة.',
          ]}
        />
      </LegalSection>

      <LegalSection title="رابعًا – الحالات غير المشمولة">
        <PolicyList
          tone="no"
          items={[
            'عدم الرضا الشخصي المرتبط بالذوق أو التوقّعات.',
            'سوء التخزين أو الاستخدام بعد الاستلام.',
          ]}
        />
        <p className="text-zinc-500 text-sm">
          تذكير: اختلاف لون العسل أو قوامه أو تبلوره باختلاف الموسم والمرعى من طبيعة المنتج ولا
          يُعدّ عيباً.
        </p>
      </LegalSection>

      <LegalSection title="خامسًا – آلية المعالجة">
        <ul className="space-y-2.5">
          <li className="flex items-start gap-3">
            <RefreshCw className="w-4 h-4 text-amber-500 mt-1.5 shrink-0" />
            <span>يتم الاستبدال أو إعادة المبلغ كاملًا عند ثبوت الخلل.</span>
          </li>
          <li className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-amber-500 mt-1.5 shrink-0" />
            <span>
              نتحمّل كامل تكاليف الشحن المرتبطة بالحالة، بما فيها أجور الشحن الأساسية (
              {fmt(SHIPPING.cost)} ل.س).
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-amber-500 mt-1.5 shrink-0" />
            <span>نلتزم بمعالجة الطلب بسرعة وبما يحفظ حق الزبون.</span>
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="كيف تبلّغ عن مشكلة؟">
        <p>
          راسلنا خلال 24 ساعة من الاستلام عبر{' '}
          <a
            href={getWhatsAppLink('مرحباً، أود الإبلاغ عن مشكلة في طلبي وفق سياسة الاسترجاع.')}
            target="_blank"
            rel="noopener noreferrer"
          >
            واتساب
          </a>{' '}
          أو على <a href={`mailto:${SITE.email}`}>{SITE.email}</a>، مرفقاً رقم الطلب وصورة أو فيديو
          يوضّح المشكلة.
        </p>
      </LegalSection>

      <div className="bg-amber-500/5 rounded-2xl p-6 border border-amber-500/20 text-center">
        <p className="text-amber-500 font-bold text-base md:text-lg leading-relaxed">
          هذه السياسة تعكس التزامنا بالجودة، وتحفظ حق الزبون، وتضمن عدالة التعامل.
        </p>
      </div>
    </LegalPage>
  );
}
