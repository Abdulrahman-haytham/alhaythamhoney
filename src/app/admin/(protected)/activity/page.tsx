import Link from 'next/link';
import { db } from '@/lib/db';
import { ACTION_LABELS, ENTITY_LABELS } from '@/lib/audit.server';

export const dynamic = 'force-dynamic';
const PAGE = 50;
const dateFmt = new Intl.DateTimeFormat('ar-SY', { dateStyle: 'medium', timeStyle: 'short' });

const fmtValue = (v: unknown) =>
  v === null || v === undefined || v === ''
    ? '—'
    : typeof v === 'object'
      ? JSON.stringify(v)
      : String(v);

/** سجلّ التغييرات الكامل — من غيّر ماذا ومتى، مع القيم قبل وبعد. */
export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; entity?: string }>;
}) {
  const { page: p, entity } = await searchParams;
  const page = Math.max(1, Number(p) || 1);
  const where = entity ? { entity } : {};
  const [rows, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE,
      take: PAGE,
    }),
    db.auditLog.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <>
      <h1 className="mb-3 font-amiri text-3xl font-bold">سجلّ التغييرات</h1>
      <p className="mb-6 text-sm text-zinc-400">
        كل تعديل من اللوحة يُسجَّل هنا مع الحقول التي تغيّرت وقيمها السابقة — لتعرف كم كان السعر قبل
        التعديل، ومن غيّره ومتى.
      </p>
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <Link
          href="/admin/activity"
          className={`rounded-full border px-3 py-1 ${!entity ? 'border-amber-500 text-amber-300' : 'border-zinc-700 text-zinc-400'}`}
        >
          الكل
        </Link>
        {Object.entries(ENTITY_LABELS).map(([k, v]) => (
          <Link
            key={k}
            href={`/admin/activity?entity=${k}`}
            className={`rounded-full border px-3 py-1 ${entity === k ? 'border-amber-500 text-amber-300' : 'border-zinc-700 text-zinc-400'}`}
          >
            {v}
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
          لا تغييرات مسجّلة.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((a) => {
            const changes = (a.changes ?? null) as Record<
              string,
              { from: unknown; to: unknown }
            > | null;
            const keys = changes ? Object.keys(changes) : [];
            return (
              <li
                key={a.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <time className="text-xs text-zinc-500">{dateFmt.format(a.createdAt)}</time>
                  <span className="text-zinc-400">{a.actor}</span>
                  <span className="font-bold text-white">
                    {ACTION_LABELS[a.action] ?? a.action} {ENTITY_LABELS[a.entity] ?? a.entity}
                  </span>
                  {a.label && <span className="text-amber-300">«{a.label}»</span>}
                  {keys.length > 0 && (
                    <span className="text-xs text-zinc-500">{keys.length} حقلاً</span>
                  )}
                </div>
                {keys.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-amber-400">التفاصيل</summary>
                    <table className="mt-2 w-full text-xs">
                      <tbody>
                        {keys.map((k) => (
                          <tr key={k} className="border-t border-zinc-800 align-top">
                            <th className="w-32 py-1 pl-2 text-right font-mono text-zinc-400">
                              {k}
                            </th>
                            <td className="py-1 pl-2 text-red-300/80 line-through">
                              {fmtValue(changes![k].from)}
                            </td>
                            <td className="py-1 text-green-300">{fmtValue(changes![k].to)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-3 text-sm">
          {page > 1 && (
            <Link
              href={`/admin/activity?page=${page - 1}${entity ? `&entity=${entity}` : ''}`}
              className="text-amber-400"
            >
              → الأحدث
            </Link>
          )}
          <span className="text-zinc-500">
            {page} / {pages}
          </span>
          {page < pages && (
            <Link
              href={`/admin/activity?page=${page + 1}${entity ? `&entity=${entity}` : ''}`}
              className="text-amber-400"
            >
              الأقدم ←
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
