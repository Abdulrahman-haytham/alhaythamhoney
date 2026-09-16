'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';

const inputClass =
  'mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none';

/** نموذج طلب عرض سعر للجملة — يصل إلى اللوحة كـ«فرصة» بحالة جديدة */
export function LeadForm() {
  const [form, setForm] = useState({
    name: '',
    business: '',
    phone: '',
    email: '',
    city: '',
    quantity: '',
    message: '',
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        email: form.email.trim() || null,
        quantity: form.quantity.trim() || null,
      }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setError(data.error || 'تعذّر الإرسال — حاول عبر واتساب.');
    setDone(true);
  }

  if (done)
    return (
      <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-400" />
        <h2 className="font-amiri text-2xl font-bold text-white">وصل طلبك</h2>
        <p className="mt-2 text-sm text-zinc-300">
          سنراجع الكميات ونتصل بك خلال يوم عمل بعرض سعر مناسب.
        </p>
      </div>
    );

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-zinc-300">
          اسمك
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            minLength={2}
            maxLength={80}
          />
        </label>
        <label className="text-sm text-zinc-300">
          اسم المحل / المطعم / الجهة
          <input
            className={inputClass}
            value={form.business}
            onChange={(e) => set('business', e.target.value)}
            required
            minLength={2}
            maxLength={120}
          />
        </label>
        <label className="text-sm text-zinc-300">
          رقم الهاتف (واتساب)
          <input
            className={inputClass}
            type="tel"
            dir="ltr"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            required
            placeholder="09xxxxxxxx"
          />
        </label>
        <label className="text-sm text-zinc-300">
          البريد (اختياري)
          <input
            className={inputClass}
            type="email"
            dir="ltr"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </label>
        <label className="text-sm text-zinc-300">
          المدينة
          <input
            className={inputClass}
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            required
            minLength={2}
            maxLength={60}
          />
        </label>
        <label className="text-sm text-zinc-300">
          الكميات التقريبية (اختياري)
          <input
            className={inputClass}
            value={form.quantity}
            onChange={(e) => set('quantity', e.target.value)}
            maxLength={200}
            placeholder="مثال: 20 كغ سدر شهرياً"
          />
        </label>
      </div>
      <label className="block text-sm text-zinc-300">
        ما الذي تحتاجه؟
        <textarea
          className={`${inputClass} min-h-[110px]`}
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          required
          minLength={10}
          maxLength={2000}
          placeholder="الأصناف، التغليف المطلوب، تكرار الطلب…"
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        أرسل طلب عرض السعر
      </button>
    </form>
  );
}
