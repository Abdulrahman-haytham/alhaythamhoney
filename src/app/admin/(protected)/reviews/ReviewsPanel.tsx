'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Check, X, Trash2 } from 'lucide-react';

export interface AdminReview {
  id: string;
  authorName: string;
  authorCity: string | null;
  rating: number;
  body: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  orderRef: string | null;
  createdAt: string;
  productName: string | null;
}

const STATUS_LABEL: Record<AdminReview['status'], string> = {
  PENDING: 'بانتظار المراجعة',
  APPROVED: 'منشور',
  REJECTED: 'مرفوض',
};

const STATUS_STYLE: Record<AdminReview['status'], string> = {
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  APPROVED: 'bg-green-600/10 text-green-400 border-green-600/30',
  REJECTED: 'bg-zinc-700/30 text-zinc-400 border-zinc-700',
};

export function ReviewsPanel({ reviews }: { reviews: AdminReview[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | AdminReview['status']>('PENDING');

  async function updateReview(
    id: string,
    method: 'PATCH' | 'DELETE',
    status?: AdminReview['status'],
  ) {
    setBusy(id);
    setError('');
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: status ? JSON.stringify({ status }) : undefined,
      });
      if (!response.ok) throw new Error('تعذر حفظ التغيير. تحقق من الاتصال وصلاحية جلسة الدخول.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر الاتصال بالخادم. حاول مرة أخرى.');
    } finally {
      setBusy(null);
    }
  }

  async function setStatus(id: string, status: AdminReview['status']) {
    await updateReview(id, 'PATCH', status);
  }

  async function remove(id: string) {
    if (!confirm('حذف هذا التقييم نهائياً؟')) return;
    await updateReview(id, 'DELETE');
  }

  const shown = filter === 'ALL' ? reviews : reviews.filter((r) => r.status === filter);
  const pendingCount = reviews.filter((r) => r.status === 'PENDING').length;

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 text-red-400">
          {error}
        </p>
      )}
      <div className="mb-6 flex flex-wrap gap-2">
        {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`h-10 rounded-xl border px-4 text-sm font-medium transition-colors ${
              filter === f
                ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {f === 'ALL' ? 'الكل' : STATUS_LABEL[f]}
            {f === 'PENDING' && pendingCount > 0 && (
              <span className="mr-2 rounded-full bg-amber-500 px-1.5 text-xs font-bold text-zinc-950 tabular-nums">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="py-16 text-center text-zinc-500">لا توجد تقييمات في هذا التصنيف.</p>
      ) : (
        <ul className="space-y-4">
          {shown.map((r) => (
            <li key={r.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="font-bold text-white">{r.authorName}</span>
                {r.authorCity && <span className="text-xs text-zinc-500">{r.authorCity}</span>}
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[r.status]}`}
                >
                  {STATUS_LABEL[r.status]}
                </span>
                <span className="text-xs text-zinc-600">{r.productName ?? 'تقييم عام للمتجر'}</span>
              </div>

              <div className="mb-2 flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i <= r.rating ? 'text-amber-500' : 'text-zinc-700'}`}
                    fill={i <= r.rating ? 'currentColor' : 'none'}
                  />
                ))}
              </div>

              <p className="mb-4 leading-relaxed text-zinc-300">{r.body}</p>

              <div className="flex flex-wrap gap-2">
                {r.status !== 'APPROVED' && (
                  <button
                    onClick={() => setStatus(r.id, 'APPROVED')}
                    disabled={busy === r.id}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-bold text-white transition-colors hover:bg-green-500 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    اعتماد ونشر
                  </button>
                )}
                {r.status !== 'REJECTED' && (
                  <button
                    onClick={() => setStatus(r.id, 'REJECTED')}
                    disabled={busy === r.id}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-700 px-4 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    رفض
                  </button>
                )}
                <button
                  onClick={() => remove(r.id)}
                  disabled={busy === r.id}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-900/50 px-4 text-sm text-red-400 transition-colors hover:bg-red-950/30 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
