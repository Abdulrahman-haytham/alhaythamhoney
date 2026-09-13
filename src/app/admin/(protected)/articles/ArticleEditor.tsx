'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Link2,
  List,
  Quote,
  Save,
  Trash2,
  Eye,
  PenLine,
  Upload,
  ExternalLink,
} from 'lucide-react';

export interface ArticleForm {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  image: string | null;
  body: string;
  published: boolean;
  publishedAt: string;
}

const today = () => new Date().toISOString().slice(0, 10);
const empty: ArticleForm = {
  slug: '',
  title: '',
  description: '',
  keywords: [],
  image: null,
  body: '',
  published: false,
  publishedAt: today(),
};

/** أزرار شريط التنسيق — كل زر يلفّ التحديد بعلامات Markdown، والأخير يفتح منتقي الصور. */
const TOOLS: {
  icon: typeof Bold;
  label: string;
  wrap?: [before: string, after: string, placeholder: string];
}[] = [
  { icon: Heading2, label: 'عنوان رئيسي', wrap: ['\n## ', '\n', 'عنوان'] },
  { icon: Heading3, label: 'عنوان فرعي', wrap: ['\n### ', '\n', 'عنوان'] },
  { icon: Bold, label: 'غامق', wrap: ['**', '**', 'نص'] },
  { icon: List, label: 'قائمة', wrap: ['\n- ', '\n', 'عنصر'] },
  { icon: Quote, label: 'اقتباس', wrap: ['\n> ', '\n', 'اقتباس'] },
  { icon: Link2, label: 'رابط', wrap: ['[', '](https://)', 'نص الرابط'] },
  { icon: ImagePlus, label: 'صورة داخل المقال' },
];

const inputClass =
  'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-base text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none disabled:text-zinc-500';

async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/admin/articles/image', { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'تعذّر رفع الصورة.');
  return data.url as string;
}

export function ArticleEditor({ article }: { article?: ArticleForm & { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<ArticleForm>(() => {
    if (!article) return empty;
    const { id: _id, ...rest } = article;
    return rest;
  });
  const [keywordsText, setKeywordsText] = useState((article?.keywords ?? []).join('، '));
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [dirty, setDirty] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  // تحذير قبل مغادرة الصفحة مع تعديلات غير محفوظة
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  async function showPreview() {
    setTab('preview');
    const res = await fetch('/api/admin/articles/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: form.body }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setPreview(data.html ?? '<p>تعذّر توليد المعاينة.</p>');
  }

  /** يُدرج نصاً حول التحديد الحالي في محرّر الجسم (أو عند المؤشر). */
  function wrapSelection(before: string, after = '', placeholder = '') {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const selected = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + selected + after + value.slice(e);
    set('body', next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + selected.length);
    });
  }

  async function insertInlineImage(file: File) {
    setMessage(null);
    try {
      const url = await uploadImage(file);
      wrapSelection(`\n![وصف الصورة](${url})\n`);
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'تعذّر الرفع.', ok: false });
    }
  }

  async function setCover(file: File) {
    setMessage(null);
    try {
      set('image', await uploadImage(file));
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'تعذّر الرفع.', ok: false });
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const keywords = keywordsText
      .split(/[,،]/)
      .map((k) => k.trim())
      .filter(Boolean);
    try {
      const res = await fetch(
        article ? `/api/admin/articles/${article.id}` : '/api/admin/articles',
        {
          method: article ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, keywords }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'تعذّر الحفظ.');
      setDirty(false);
      setMessage({ text: 'تم الحفظ.', ok: true });
      if (article) router.refresh();
      else router.push(`/admin/articles/${data.id}`);
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'تعذّر الاتصال.',
        ok: false,
      });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!article || !window.confirm(`حذف «${form.title}» نهائياً؟ لا يمكن التراجع.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/articles/${article.id}`, { method: 'DELETE' }).catch(
      () => null,
    );
    if (res?.ok) {
      setDirty(false);
      router.push('/admin/articles');
      router.refresh();
    } else {
      setMessage({ text: 'تعذّر الحذف.', ok: false });
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-2 sm:p-6">
        <label className="sm:col-span-2">
          العنوان
          <input
            className={`${inputClass} font-amiri text-xl`}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            required
            minLength={3}
            maxLength={200}
          />
        </label>
        <label>
          الرابط {article ? '(لا يتغير بعد الإنشاء)' : '(بالإنجليزية، كلمات مفصولة بشرطة)'}
          <input
            className={inputClass}
            dir="ltr"
            value={form.slug}
            disabled={!!article}
            onChange={(e) => set('slug', e.target.value.toLowerCase())}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="honey-benefits"
          />
        </label>
        <label>
          تاريخ النشر
          <input
            className={inputClass}
            type="date"
            value={form.publishedAt}
            onChange={(e) => set('publishedAt', e.target.value)}
            required
          />
          <span className="mt-1 block text-[11px] text-zinc-500">
            تاريخ مستقبلي = يُنشر تلقائياً في ذلك اليوم.
          </span>
        </label>
        <label className="sm:col-span-2">
          الوصف المختصر (يظهر في نتائج البحث وبطاقة المقال)
          <textarea
            className={inputClass}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
            required
            minLength={10}
            maxLength={400}
          />
          <span
            className={`mt-1 block text-[11px] ${form.description.length > 160 ? 'text-amber-400' : 'text-zinc-500'}`}
          >
            {form.description.length}/160 حرفاً مثالي لغوغل
          </span>
        </label>
        <label className="sm:col-span-2">
          الكلمات المفتاحية (مفصولة بفاصلة)
          <input
            className={inputClass}
            value={keywordsText}
            onChange={(e) => {
              setKeywordsText(e.target.value);
              setDirty(true);
            }}
            placeholder="عسل طبيعي، فوائد العسل"
          />
        </label>
        <div className="sm:col-span-2">
          <span>صورة الغلاف</span>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {form.image ? (
              <img
                src={form.image}
                alt=""
                className="h-20 w-32 rounded-lg border border-zinc-700 object-cover"
              />
            ) : (
              <div className="flex h-20 w-32 items-center justify-center rounded-lg border border-dashed border-zinc-700 text-xs text-zinc-600">
                بلا غلاف
              </div>
            )}
            <input
              className={`${inputClass} mt-0 flex-1 min-w-[200px]`}
              dir="ltr"
              value={form.image ?? ''}
              onChange={(e) => set('image', e.target.value || null)}
              placeholder="/uploads/studio/… أو /images/…"
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-amber-500/50"
            >
              <Upload className="h-4 w-4" />
              رفع صورة
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void setCover(file);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40">
        <div className="flex flex-wrap items-center gap-1 border-b border-zinc-800 p-2">
          <div className="flex rounded-lg bg-zinc-950 p-0.5">
            <button
              type="button"
              onClick={() => setTab('write')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${tab === 'write' ? 'bg-amber-500 font-bold text-zinc-950' : 'text-zinc-400'}`}
            >
              <PenLine className="h-4 w-4" /> كتابة
            </button>
            <button
              type="button"
              onClick={showPreview}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${tab === 'preview' ? 'bg-amber-500 font-bold text-zinc-950' : 'text-zinc-400'}`}
            >
              <Eye className="h-4 w-4" /> معاينة
            </button>
          </div>
          {tab === 'write' && (
            <div className="mr-auto flex flex-wrap gap-0.5">
              {TOOLS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  title={t.label}
                  aria-label={t.label}
                  onClick={() =>
                    t.wrap ? wrapSelection(...t.wrap) : inlineInputRef.current?.click()
                  }
                  className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <t.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          )}
          <input
            ref={inlineInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void insertInlineImage(file);
              e.target.value = '';
            }}
          />
        </div>
        {tab === 'write' ? (
          <textarea
            ref={bodyRef}
            aria-label="نص المقال"
            className="min-h-[420px] w-full resize-y bg-transparent p-4 text-base leading-relaxed text-zinc-100 focus:outline-none"
            value={form.body}
            onChange={(e) => set('body', e.target.value)}
            placeholder={'## عنوان الفقرة\n\nاكتب هنا… يمكنك استخدام Markdown أو HTML بسيط.'}
            required
          />
        ) : (
          <div
            className="prose min-h-[420px] p-4 sm:p-6"
            dangerouslySetInnerHTML={{ __html: preview || '<p>جارٍ التوليد…</p>' }}
          />
        )}
        <p className="border-t border-zinc-800 px-4 py-2 text-[11px] text-zinc-500">
          نصائح: ابدأ الفقرات بعناوين ## واضحة، وأضف رابطاً لمنتج ذي صلة داخل النص — يرفع ترتيب
          المقال ويحوّل القارئ إلى مشترٍ.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => set('published', e.target.checked)}
            className="h-4 w-4 accent-amber-500"
          />
          منشور
        </label>
        <button
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {busy ? 'جارٍ الحفظ…' : article ? 'حفظ التعديلات' : 'إنشاء المقال'}
        </button>
        {article && (
          <a
            href={`/articles/${article.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-300 hover:text-amber-400"
          >
            <ExternalLink className="h-4 w-4" />
            عرض على الموقع
          </a>
        )}
        {message && (
          <p role="status" className={`text-sm ${message.ok ? 'text-green-400' : 'text-red-400'}`}>
            {message.text}
          </p>
        )}
        {article && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="mr-auto inline-flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            حذف المقال
          </button>
        )}
      </div>
    </form>
  );
}
