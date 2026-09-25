import { Eye, MonitorSmartphone } from 'lucide-react';
import type { VisitsSummary } from '@/lib/visits.server';

const dayFmt = new Intl.DateTimeFormat('ar-SY', { day: 'numeric', month: 'numeric' });

/** زيارات الموقع من أحداثه نفسها — لا غوغل أناليتكس ولا بيانات تغادر الخادم. */
export function VisitsCard({ visits }: { visits: VisitsSummary }) {
  const peak = Math.max(1, ...visits.daily.map((d) => d.count));
  const totalVisits = visits.devices.mobile + visits.devices.desktop;
  const mobilePct = totalVisits ? Math.round((visits.devices.mobile / totalVisits) * 100) : 0;
  const trend = visits.today - visits.yesterday;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-400">
        <Eye className="h-4 w-4" /> الزيارات
      </h2>

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'اليوم', value: visits.today },
          { label: 'أمس', value: visits.yesterday },
          { label: 'الأسبوع', value: visits.week },
          { label: 'الشهر', value: visits.month },
        ].map((k) => (
          <div key={k.label} className="rounded-xl bg-zinc-950/60 py-2">
            <p className="text-lg font-bold tabular-nums text-white">{k.value}</p>
            <p className="text-[10px] text-zinc-500">{k.label}</p>
          </div>
        ))}
      </div>
      {visits.yesterday > 0 && (
        <p className={`mt-2 text-[11px] ${trend >= 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)} مقارنةً بأمس
        </p>
      )}

      {/* رسم عمودي بسيط: آخر ١٤ يوماً */}
      <div className="mt-4 flex h-20 items-end gap-1" dir="ltr">
        {visits.daily.map((d) => (
          <div key={d.day} className="group relative flex-1">
            <div
              className="w-full rounded-t bg-amber-500/70 transition-colors group-hover:bg-amber-400"
              style={{ height: `${Math.max(2, (d.count / peak) * 72)}px` }}
            />
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-zinc-950 px-1.5 py-0.5 text-[10px] text-zinc-200 ring-1 ring-zinc-700 group-hover:block">
              {dayFmt.format(new Date(d.day))}: {d.count}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-1 text-[10px] text-zinc-600">آخر ١٤ يوماً — مرّر فوق العمود للتفصيل</p>

      <div className="mt-4 grid gap-4 border-t border-zinc-800 pt-3 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] font-bold text-zinc-400">أكثر الصفحات زيارةً (٣٠ يوماً)</p>
          {visits.topPages.length === 0 ? (
            <p className="text-[11px] text-zinc-600">لا بيانات بعد</p>
          ) : (
            <ul className="space-y-1">
              {visits.topPages.slice(0, 6).map((p) => (
                <li key={p.path} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate text-zinc-300" dir="ltr">
                    {p.path}
                  </span>
                  <span className="shrink-0 tabular-nums text-zinc-500">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold text-zinc-400">من أين جاؤوا</p>
          {visits.sources.length === 0 ? (
            <p className="text-[11px] text-zinc-600">لا بيانات بعد</p>
          ) : (
            <ul className="space-y-1">
              {visits.sources.slice(0, 5).map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate text-zinc-300">{s.name}</span>
                  <span className="shrink-0 tabular-nums text-zinc-500">{s.count}</span>
                </li>
              ))}
            </ul>
          )}
          {totalVisits > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400">
              <MonitorSmartphone className="h-3.5 w-3.5 text-amber-500" />
              {mobilePct}% جوال · {100 - mobilePct}% سطح مكتب
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
