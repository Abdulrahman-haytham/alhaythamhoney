'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Trash2 } from 'lucide-react';
import {
  GLOSSARY_ICON_KEYS,
  GLOSSARY_ICON_LABELS,
  isGlossaryIconKey,
  toArabicIndic,
  type GlossaryIconKey,
} from '@/lib/glossary';
import { StageIcon } from '@/components/glossary/StageIcon';

export interface StageRow {
  /** null = تصنيف مكتوب في مدخل ولم يُحفظ له صفّ مرحلة بعد — الحفظ يُنشئه */
  id: string | null;
  name: string;
  intro: string | null;
  icon: string | null;
  sortOrder: number;
  /** عدد المداخل (منشورة أو لا) التي تحمل هذا الاسم */
  used: number;
}

const inputClass =
  'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none';

function Editor({
  stage,
  position,
  onDone,
}: {
  stage?: StageRow;
  /** رقم المرحلة كما سيراه الزائر (١، ٢، …) */
  position?: number;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(stage?.name ?? '');
  const [intro, setIntro] = useState(stage?.intro ?? '');
  const [icon, setIcon] = useState<GlossaryIconKey | ''>(
    isGlossaryIconKey(stage?.icon) ? stage.icon : '',
  );
  const [sortOrder, setSortOrder] = useState(stage?.sortOrder ?? 0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const res = await fetch(
      stage?.id ? `/api/admin/glossary/categories/${stage.id}` : '/api/admin/glossary/categories',
      {
        method: stage?.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          intro: intro.trim() || null,
          icon: icon || null,
          sortOrder,
        }),
      },
    ).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setMessage(data.error || 'تعذّر الحفظ.');
    setMessage(data.moved ? `تم الحفظ ونُقل ${data.moved} مدخلاً إلى الاسم الجديد.` : 'تم الحفظ.');
    router.refresh();
    onDone?.();
  }

  async function remove() {
    if (!stage?.id || !confirm(`حذف مرحلة «${stage.name}»؟`)) return;
    const res = await fetch(`/api/admin/glossary/categories/${stage.id}`, {
      method: 'DELETE',
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok) return setMessage(data.error || 'تعذّر الحذف.');
    router.refresh();
  }

  return (
    <form
      onSubmit={save}
      className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
    >
      <div className="flex items-start gap-3 sm:flex-col sm:items-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/40 font-amiri text-lg font-bold text-amber-300">
          {position ? toArabicIndic(position) : '＋'}
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-500">
          <StageIcon icon={icon || null} className="h-5 w-5" />
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm sm:col-span-2">
          اسم المرحلة
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={60}
            placeholder="أدوات النحّال"
          />
        </label>
        <label className="text-sm">
          الأيقونة
          <select
            className={inputClass}
            value={icon}
            onChange={(e) => setIcon(e.target.value as GlossaryIconKey | '')}
          >
            <option value="">— افتراضية (كتاب)</option>
            {GLOSSARY_ICON_KEYS.map((k) => (
              <option key={k} value={k}>
                {GLOSSARY_ICON_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm sm:col-span-3">
          مقدّمة المرحلة (جملة واحدة: ماذا يحدث فيها)
          <textarea
            className={`${inputClass} min-h-[64px]`}
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            maxLength={300}
            placeholder="قبل أن تلمس إطاراً واحداً، تحتاج إلى ثلاث أدوات…"
          />
        </label>
      </div>

      <div className="flex flex-row items-end gap-3 sm:flex-col sm:items-stretch">
        <label className="text-sm">
          الترتيب
          <input
            className={`${inputClass} w-20`}
            type="number"
            min={0}
            max={1000}
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
        </label>
        <button
          disabled={busy}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-zinc-950 disabled:opacity-50"
        >
          {busy ? '…' : stage?.id ? 'حفظ' : stage ? 'حفظ كمرحلة' : 'إضافة'}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:col-span-3">
        {stage && (
          <>
            <span className="text-xs text-zinc-500">
              {stage.used > 0
                ? `${stage.used} مدخلاً في هذه المرحلة`
                : 'لا مداخل بعد — لن تظهر للزوار'}
              {!stage.id && ' · كُتبت في مدخل ولم تُحفظ بعد كمرحلة'}
            </span>
            {stage.used > 0 && position && (
              <a
                href={`/beekeeping#stage-${position}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs text-zinc-300 hover:text-amber-400"
              >
                <ExternalLink className="h-3.5 w-3.5" /> عرض المرحلة
              </a>
            )}
            <button
              type="button"
              onClick={remove}
              disabled={stage.used > 0 || !stage.id}
              title={stage.used > 0 ? 'انقل مداخلها أولاً' : undefined}
              className="mr-auto inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" /> حذف
            </button>
          </>
        )}
        {message && (
          <p role="status" className="w-full text-sm text-zinc-400">
            {message}
          </p>
        )}
      </div>
    </form>
  );
}

/**
 * لوحة المراحل: ترتيب الموسوعة كما يراها الزائر. المرحلة بلا مداخل منشورة لا تظهر للزوار
 * لكنها تبقى هنا جاهزة، وتغيير اسمها ينقل مداخلها معها.
 */
export function StagesPanel({ stages }: { stages: StageRow[] }) {
  const [creating, setCreating] = useState(false);
  // رقم المرحلة عند الزائر = ترتيبها بين المراحل التي لها مداخل فقط
  const positions = stages.reduce<(number | undefined)[]>((acc, s) => {
    const last = acc.findLast((p) => p !== undefined) ?? 0;
    acc.push(s.used > 0 ? last + 1 : undefined);
    return acc;
  }, []);

  return (
    <div className="space-y-3">
      <button
        className="rounded-lg border border-amber-500 px-4 py-2.5 text-sm text-amber-400"
        onClick={() => setCreating(!creating)}
      >
        {creating ? 'إلغاء' : '+ مرحلة جديدة'}
      </button>
      {creating && <Editor onDone={() => setCreating(false)} />}
      {stages.map((s, i) => (
        <Editor key={s.id ?? s.name} stage={s} position={positions[i]} />
      ))}
    </div>
  );
}
