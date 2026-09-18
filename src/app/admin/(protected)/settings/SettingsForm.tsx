'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Check, Upload } from 'lucide-react';
import type { SiteSettingsData } from '@/lib/settings';

const inputClass =
  'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-base text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none';

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="font-amiri text-xl font-bold text-white">{title}</h2>
      {hint && <p className="mt-1 mb-4 text-xs text-zinc-500">{hint}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

/** عدّاد أحرف: يحمرّ عند تجاوز الحدّ الذي يقصّ غوغل بعده النص. */
function Counter({ value, limit }: { value: string; limit: number }) {
  const over = value.length > limit;
  return (
    <span className={`text-[11px] ${over ? 'text-red-400' : 'text-zinc-500'}`}>
      {value.length} / {limit}
      {over ? ' — سيُقصّ في نتائج البحث' : ''}
    </span>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-zinc-800 p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-amber-500"
      />
      <span>
        <span className="block text-sm font-bold text-zinc-200">{label}</span>
        {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
      </span>
    </label>
  );
}

export function SettingsForm({ initial }: { initial: SiteSettingsData }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);
  const heroInput = useRef<HTMLInputElement>(null);

  function set<K extends keyof SiteSettingsData>(key: K, value: SiteSettingsData[K]) {
    setS((cur) => ({ ...cur, [key]: value }));
  }
  const num = (v: string) => (v === '' ? 0 : Number(v));

  async function uploadHero(file: File) {
    setError(null);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/admin/images', { method: 'POST', body: form }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok) return setError(data.error || 'تعذّر رفع الصورة.');
    set('heroImage', data.url);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState('saving');
    setError(null);
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok) {
      setError(data.error || 'تعذّر الحفظ.');
      setState('idle');
      return;
    }
    setState('saved');
    router.refresh();
    setTimeout(() => setState('idle'), 1800);
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <Section title="التواصل" hint="يُستخدم في كل أزرار واتساب والتذييل وبطاقة التواصل.">
        <label>
          رقم واتساب (دولي بلا +)
          <input
            className={inputClass}
            dir="ltr"
            inputMode="numeric"
            value={s.whatsappNumber}
            onChange={(e) => set('whatsappNumber', e.target.value.replace(/\D/g, ''))}
            placeholder="963947931959"
            required
          />
        </label>
        <label>
          الرقم كما يُعرض للزوار
          <input
            className={inputClass}
            dir="ltr"
            value={s.phoneDisplay}
            onChange={(e) => set('phoneDisplay', e.target.value)}
            placeholder="+963 947 931 959"
            required
          />
        </label>
        <label>
          البريد الإلكتروني (اختياري)
          <input
            className={inputClass}
            dir="ltr"
            type="email"
            value={s.email ?? ''}
            onChange={(e) => set('email', e.target.value || null)}
          />
        </label>
        <label>
          ساعات العمل
          <input
            className={inputClass}
            value={s.workingHours}
            onChange={(e) => set('workingHours', e.target.value)}
            required
          />
        </label>
      </Section>

      <Section title="الشحن" hint="يظهر في السلة وشريط التقدّم وصفحة الشروط.">
        <label>
          أجور الشحن (ل.س)
          <input
            className={inputClass}
            type="number"
            min={0}
            value={s.shippingCost}
            onChange={(e) => set('shippingCost', num(e.target.value))}
          />
        </label>
        <label>
          عتبة التوصيل المجاني (ل.س) — 0 لتعطيله
          <input
            className={inputClass}
            type="number"
            min={0}
            value={s.freeShippingThreshold}
            onChange={(e) => set('freeShippingThreshold', num(e.target.value))}
          />
        </label>
        <Toggle
          label="الشحن حسب المحافظة"
          hint="يختار الزبون محافظته في السلة فيرى تكلفتها ومدة التوصيل من جدول المناطق أدناه. بلا اختيار تُستخدم الأجور الموحّدة."
          checked={s.shippingZonesEnabled}
          onChange={(v) => set('shippingZonesEnabled', v)}
        />
      </Section>

      <Section
        title="الظهور في محركات البحث"
        hint="ما يظهر في نتيجة غوغل لصفحتك الأولى. اتركه فارغاً ليستعمل الموقع اسم المتجر وشعاره كما كان."
      >
        <label className="sm:col-span-2">
          عنوان الصفحة الأولى في غوغل
          <input
            className={inputClass}
            value={s.seoTitle ?? ''}
            onChange={(e) => set('seoTitle', e.target.value || null)}
            maxLength={60}
            placeholder="عسل سوري طبيعي 100% من مراعي حماة"
          />
          <span className="mt-1 flex justify-between">
            <span className="text-[11px] text-zinc-500">
              اذكر ما يبحث به الناس: نوع المنتج، المنطقة، واسمك.
            </span>
            <Counter value={s.seoTitle ?? ''} limit={60} />
          </span>
        </label>

        <label className="sm:col-span-2">
          الوصف تحت العنوان في غوغل
          <textarea
            className={inputClass}
            rows={2}
            value={s.seoDescription ?? ''}
            onChange={(e) => set('seoDescription', e.target.value || null)}
            maxLength={160}
            placeholder="عسل مفحوص مخبرياً من مراعي حماة، بالدفع عند الاستلام وشحن لكل المحافظات."
          />
          <span className="mt-1 flex justify-between">
            <span className="text-[11px] text-zinc-500">
              جملة تقنع بالضغط — لا تؤثر في الترتيب لكنها تؤثر في نسبة النقر.
            </span>
            <Counter value={s.seoDescription ?? ''} limit={160} />
          </span>
        </label>

        {/* معاينة تقريبية لشكل النتيجة — أسرع من النشر والانتظار لرؤية الأثر */}
        <div className="sm:col-span-2 rounded-xl border border-zinc-800 bg-white p-4" dir="rtl">
          <p className="text-[11px] text-[#5f6368]">معاينة نتيجة البحث</p>
          <p className="mt-2 truncate text-[13px] text-[#202124]">alhaythamhoney.sy</p>
          <p className="truncate text-[18px] leading-snug text-[#1a0dab]">
            {s.seoTitle?.trim() || 'الهيثم — نحل وعسل'}
          </p>
          <p className="line-clamp-2 text-[13px] leading-relaxed text-[#4d5156]">
            {s.seoDescription?.trim() || 'عسل طبيعي وخلطات نحل أصيلة من قلب حماة'}
          </p>
        </div>

        <label className="sm:col-span-2">
          أسماء أخرى تُعرف بها (بفاصلة)
          <input
            className={inputClass}
            value={s.brandAliases.join('، ')}
            onChange={(e) =>
              set(
                'brandAliases',
                e.target.value
                  .split(/[،,]/)
                  .map((v) => v.trim())
                  .filter(Boolean)
                  .slice(0, 6),
              )
            }
            placeholder="عسل الهيثم، مناحل الهيثم، Al-Haytham Honey"
          />
          <span className="mt-1 block text-[11px] text-zinc-500">
            الصيغ التي يكتبها الناس في البحث عنك. تُرسَل لمحركات البحث لتعرف أنها جميعاً اسمك.
          </span>
        </label>
      </Section>

      <Section title="الصفحة الأولى (الهيرو)">
        <label className="sm:col-span-2">
          الشارة الصغيرة فوق العنوان
          <input
            className={inputClass}
            value={s.heroBadge}
            onChange={(e) => set('heroBadge', e.target.value)}
          />
        </label>
        <label>
          العنوان الرئيسي
          <input
            className={inputClass}
            value={s.heroTitle}
            onChange={(e) => set('heroTitle', e.target.value)}
          />
        </label>
        <label>
          السطر الذهبي
          <input
            className={inputClass}
            value={s.heroHighlight}
            onChange={(e) => set('heroHighlight', e.target.value)}
          />
        </label>
        <label className="sm:col-span-2">
          الوصف تحت العنوان
          <textarea
            className={inputClass}
            rows={2}
            value={s.heroSubtitle}
            onChange={(e) => set('heroSubtitle', e.target.value)}
          />
        </label>
        <div className="sm:col-span-2">
          <span>صورة الخلفية (اختياري — فارغة = الصورة الافتراضية)</span>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {s.heroImage ? (
              <img
                src={s.heroImage}
                alt=""
                className="h-16 w-28 rounded-lg border border-zinc-700 object-cover"
              />
            ) : (
              <div className="flex h-16 w-28 items-center justify-center rounded-lg border border-dashed border-zinc-700 text-[11px] text-zinc-600">
                افتراضية
              </div>
            )}
            <input
              className={`${inputClass} mt-0 min-w-[200px] flex-1`}
              dir="ltr"
              value={s.heroImage ?? ''}
              onChange={(e) => set('heroImage', e.target.value || null)}
              placeholder="/uploads/studio/…"
            />
            <button
              type="button"
              onClick={() => heroInput.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-amber-500/50"
            >
              <Upload className="h-4 w-4" /> رفع
            </button>
            <input
              ref={heroInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadHero(f);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      </Section>

      <Section
        title="شريط الإعلان"
        hint="يحلّ محلّ شريط الثقة أعلى الموقع (عرض رمضان، توصيل مجاني هذا الأسبوع…)."
      >
        <Toggle
          label="تفعيل شريط الإعلان"
          checked={s.announcementEnabled}
          onChange={(v) => set('announcementEnabled', v)}
        />
        <label>
          رابط عند الضغط (اختياري)
          <input
            className={inputClass}
            dir="ltr"
            value={s.announcementLink ?? ''}
            onChange={(e) => set('announcementLink', e.target.value || null)}
            placeholder="/shop أو https://…"
          />
        </label>
        <label className="sm:col-span-2">
          نص الإعلان
          <input
            className={inputClass}
            value={s.announcementText ?? ''}
            onChange={(e) => set('announcementText', e.target.value || null)}
            maxLength={200}
            placeholder="🎁 توصيل مجاني لكل الطلبات حتى نهاية الأسبوع"
          />
        </label>
      </Section>

      <Section title="تجربة المتجر" hint="سلوكيات مقتبسة من Odoo — فعّل ما يناسبك.">
        <label>
          عتبة «بقي X فقط» (قطع) — 0 لتعطيلها
          <input
            className={inputClass}
            type="number"
            min={0}
            max={1000}
            value={s.lowStockThreshold}
            onChange={(e) => set('lowStockThreshold', num(e.target.value))}
          />
        </label>
        <label>
          اعتبار السلة «متروكة» بعد (ساعات)
          <input
            className={inputClass}
            type="number"
            min={1}
            max={720}
            value={s.cartReminderHours}
            onChange={(e) => set('cartReminderHours', Math.max(1, num(e.target.value)))}
          />
        </label>
        <Toggle
          label="تذكير السلة المتروكة"
          hint="حين يعود الزائر وفي سلته أصناف قديمة يظهر له تنبيه لطيف مرة واحدة."
          checked={s.cartReminderEnabled}
          onChange={(v) => set('cartReminderEnabled', v)}
        />
        <Toggle
          label="قسم «شاهدتَ مؤخراً»"
          hint="على الصفحة الأولى وصفحات المنتجات — يُحفظ على جهاز الزائر فقط."
          checked={s.showRecentlyViewed}
          onChange={(v) => set('showRecentlyViewed', v)}
        />
        <Toggle
          label="إكمال «يُشترى معه عادةً» تلقائياً"
          hint="إن لم تختر منتجات مرافقة يدوياً يُكمل الموقع من الفئة نفسها."
          checked={s.autoRelatedProducts}
          onChange={(v) => set('autoRelatedProducts', v)}
        />
        <Toggle
          label="حقل كوبون الخصم في السلة"
          hint="عطّله لإخفاء الحقل كلياً دون حذف الكوبونات."
          checked={s.couponsEnabled}
          onChange={(v) => set('couponsEnabled', v)}
        />
        <Toggle
          label="خصم الكمية"
          hint="شرائح «3 فأكثر = خصم X%» المعرّفة على كل منتج — تُطبَّق في السلة وتُعرض في صفحة المنتج."
          checked={s.tieredPricingEnabled}
          onChange={(v) => set('tieredPricingEnabled', v)}
        />
        <Toggle
          label="العروض التلقائية"
          hint="الهدايا والخصومات بلا كود من صفحة «العروض» — تعطيلها يوقفها كلها فوراً."
          checked={s.promotionsEnabled}
          onChange={(v) => set('promotionsEnabled', v)}
        />
        <Toggle
          label="«أعلمني عند التوفر» بالبريد"
          hint="الصنف النافد يعرض حقل بريد؛ حين ترفع كميته يُراسَل المنتظرون تلقائياً. معطّلاً يعود الزر إلى واتساب."
          checked={s.stockAlertsEnabled}
          onChange={(v) => set('stockAlertsEnabled', v)}
        />
        <Toggle
          label="صفحة الجملة والمحلات"
          hint="نموذج طلب عرض سعر في /wholesale يصل إلى «الجملة» في اللوحة وبريدك."
          checked={s.wholesaleEnabled}
          onChange={(v) => set('wholesaleEnabled', v)}
        />
        <Toggle
          label="مغذّي المنتجات لفيسبوك/إنستغرام وغوغل"
          hint="رابط /feeds/products.xml يُلصق في Meta Commerce Manager أو Google Merchant ليتحدّث الكتالوج والأسعار تلقائياً."
          checked={s.productFeedEnabled}
          onChange={(v) => set('productFeedEnabled', v)}
        />
      </Section>

      <Section
        title="نقاط الولاء"
        hint="يكسب الزبون المسجّل نقاطاً عند تأكيد طلبه من صفحة الطلبات ويستبدلها في السلة. كل الأرقام هنا تحكمها أنت — والسقف الشهري يحمي الميزانية."
      >
        <Toggle
          label="تفعيل نقاط الولاء"
          hint="معطّلاً: لا كسب ولا استبدال، وتبقى الأرصدة محفوظة."
          checked={s.loyaltyEnabled}
          onChange={(v) => set('loyaltyEnabled', v)}
        />
        <label>
          نقطة واحدة لكل (ل.س) من الطلب المؤكَّد
          <input
            className={inputClass}
            type="number"
            min={1}
            value={s.pointsPerSyp}
            onChange={(e) => set('pointsPerSyp', Math.max(1, num(e.target.value)))}
          />
        </label>
        <label>
          قيمة النقطة عند الاستبدال (ل.س)
          <input
            className={inputClass}
            type="number"
            min={1}
            value={s.pointValue}
            onChange={(e) => set('pointValue', Math.max(1, num(e.target.value)))}
          />
        </label>
        <label>
          أقل رصيد يسمح بالاستبدال (نقطة)
          <input
            className={inputClass}
            type="number"
            min={1}
            value={s.minRedeemPoints}
            onChange={(e) => set('minRedeemPoints', Math.max(1, num(e.target.value)))}
          />
        </label>
        <label>
          أقصى نسبة من الطلب تُدفع بالنقاط (%)
          <input
            className={inputClass}
            type="number"
            min={1}
            max={100}
            value={s.maxRedeemPercent}
            onChange={(e) =>
              set('maxRedeemPercent', Math.min(100, Math.max(1, num(e.target.value))))
            }
          />
        </label>
        <label>
          سقف قيمة الاستبدال شهرياً (ل.س) — 0 بلا سقف
          <input
            className={inputClass}
            type="number"
            min={0}
            value={s.loyaltyMonthlyBudget}
            onChange={(e) => set('loyaltyMonthlyBudget', num(e.target.value))}
          />
        </label>
        <p className="text-xs text-zinc-500 sm:col-span-2">
          مثال بالقيم الحالية: طلب مؤكَّد بـ 300,000 ل.س يمنح{' '}
          {Math.floor(300000 / Math.max(1, s.pointsPerSyp))} نقطة ={' '}
          {(Math.floor(300000 / Math.max(1, s.pointsPerSyp)) * s.pointValue).toLocaleString(
            'en-US',
          )}{' '}
          ل.س خصماً في طلب لاحق.
        </p>
      </Section>

      <Section
        title="ادعُ صديقاً"
        hint="رابط دعوة شخصي في حساب كل زبون. حين يُتمّ المدعوّ أول طلب مؤكَّد يحصل الطرفان على كوبون شخصي."
      >
        <Toggle
          label="تفعيل الإحالة"
          checked={s.referralEnabled}
          onChange={(v) => set('referralEnabled', v)}
        />
        <label>
          نسبة كوبون الإحالة (%)
          <input
            className={inputClass}
            type="number"
            min={1}
            max={100}
            value={s.referralPercent}
            onChange={(e) =>
              set('referralPercent', Math.min(100, Math.max(1, num(e.target.value))))
            }
          />
        </label>
        <label>
          سقف الخصم للكوبون (ل.س) — 0 بلا سقف
          <input
            className={inputClass}
            type="number"
            min={0}
            value={s.referralMaxDiscount}
            onChange={(e) => set('referralMaxDiscount', num(e.target.value))}
          />
        </label>
        <label>
          صلاحية الكوبون (أيام)
          <input
            className={inputClass}
            type="number"
            min={1}
            max={365}
            value={s.referralCouponDays}
            onChange={(e) => set('referralCouponDays', Math.max(1, num(e.target.value)))}
          />
        </label>
        <label>
          أقصى عدد إحالات مكافأة في الشهر — 0 بلا سقف
          <input
            className={inputClass}
            type="number"
            min={0}
            value={s.referralMonthlyCap}
            onChange={(e) => set('referralMonthlyCap', num(e.target.value))}
          />
        </label>
      </Section>

      <Section
        title="بريد السلة المتروكة"
        hint="للحسابات المسجّلة الموافقة على الرسائل: سلة تُركت دون طلب تصلها رسالة واحدة بمحتواها. تحتاج مهمة cron على الخادم (راجع README)."
      >
        <Toggle
          label="إرسال «سلتك بانتظارك» بالبريد"
          checked={s.abandonedCartEmailEnabled}
          onChange={(v) => set('abandonedCartEmailEnabled', v)}
        />
        <label>
          بعد كم ساعة من آخر تعديل
          <input
            className={inputClass}
            type="number"
            min={1}
            max={720}
            value={s.abandonedCartHours}
            onChange={(e) => set('abandonedCartHours', Math.max(1, num(e.target.value)))}
          />
        </label>
      </Section>

      <Section
        title="كوبون الترحيب"
        hint="يُرسل بالبريد تلقائياً لكل حساب جديد — أرخص طريقة لتحويل زائر إلى زبون مسجّل."
      >
        <Toggle
          label="تفعيل كوبون الترحيب"
          checked={s.welcomeCouponEnabled}
          onChange={(v) => set('welcomeCouponEnabled', v)}
        />
        <label>
          نسبة الخصم (%)
          <input
            className={inputClass}
            type="number"
            min={1}
            max={100}
            value={s.welcomePercent}
            onChange={(e) => set('welcomePercent', Math.min(100, Math.max(1, num(e.target.value))))}
          />
        </label>
        <label>
          سقف الخصم (ل.س) — 0 بلا سقف
          <input
            className={inputClass}
            type="number"
            min={0}
            value={s.welcomeMaxDiscount}
            onChange={(e) => set('welcomeMaxDiscount', num(e.target.value))}
          />
        </label>
        <label>
          الحد الأدنى للطلب (ل.س)
          <input
            className={inputClass}
            type="number"
            min={0}
            value={s.welcomeMinOrder}
            onChange={(e) => set('welcomeMinOrder', num(e.target.value))}
          />
        </label>
        <label>
          صلاحية الكوبون (أيام)
          <input
            className={inputClass}
            type="number"
            min={1}
            max={365}
            value={s.welcomeCouponDays}
            onChange={(e) => set('welcomeCouponDays', Math.max(1, num(e.target.value)))}
          />
        </label>
        <label>
          أقصى عدد كوبونات ترحيب في الشهر — 0 بلا سقف
          <input
            className={inputClass}
            type="number"
            min={0}
            value={s.welcomeMonthlyCap}
            onChange={(e) => set('welcomeMonthlyCap', num(e.target.value))}
          />
        </label>
      </Section>

      <div className="sticky bottom-4 flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur">
        <button
          disabled={state === 'saving'}
          className={`inline-flex h-11 items-center gap-2 rounded-xl px-6 font-bold transition-colors disabled:opacity-60 ${
            state === 'saved'
              ? 'bg-green-600 text-white'
              : 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
          }`}
        >
          {state === 'saved' ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {state === 'saving' ? 'جارٍ الحفظ…' : state === 'saved' ? 'تم الحفظ' : 'حفظ الإعدادات'}
        </button>
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
