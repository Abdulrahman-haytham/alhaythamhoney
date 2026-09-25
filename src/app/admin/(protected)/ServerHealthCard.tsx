import { Activity, Cpu, Database, HardDrive, MemoryStick, Timer } from 'lucide-react';
import type { ServerHealth } from '@/lib/health.server';

const gb = (b: number) => (b / 1024 ** 3).toFixed(1);

/** أخضر حتى ٨٠٪، أصفر حتى ٩٠٪، أحمر فوقها — حدود عملية لخادم صغير. */
function tone(percent: number) {
  if (percent >= 90) return { bar: 'bg-red-500', text: 'text-red-400' };
  if (percent >= 80) return { bar: 'bg-amber-500', text: 'text-amber-400' };
  return { bar: 'bg-emerald-500', text: 'text-emerald-400' };
}

function Meter({
  icon: Icon,
  label,
  percent,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  percent: number | null;
  detail: string;
}) {
  const t = tone(percent ?? 0);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1.5 text-zinc-400">
          <Icon className="h-3.5 w-3.5 text-amber-500" /> {label}
        </span>
        <span className={`font-bold tabular-nums ${percent === null ? 'text-zinc-500' : t.text}`}>
          {percent === null ? '—' : `${percent}%`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full ${t.bar} transition-all`}
          style={{ width: `${percent ?? 0}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-zinc-500">{detail}</p>
    </div>
  );
}

const ago = (m: number) => {
  if (m < 1) return 'الآن';
  if (m < 60) return `قبل ${m} دقيقة`;
  const h = Math.round(m / 60);
  return h < 24 ? `قبل ${h} ساعة` : `قبل ${Math.round(h / 24)} يوم`;
};

/** حالة الخادم لحظة فتح الصفحة — بلا خدمة مراقبة ولا لوحة منفصلة. */
export function ServerHealthCard({ health }: { health: ServerHealth }) {
  const jobStale = health.lastJobAgoMinutes === null || health.lastJobAgoMinutes > 15;
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-400">
        <Activity className="h-4 w-4" /> حالة الخادم
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Meter
          icon={Cpu}
          label="المعالج"
          percent={health.cpu.percent}
          detail={`${health.cpu.cores} نواة · الحمل ${health.cpu.load1}`}
        />
        <Meter
          icon={MemoryStick}
          label="الذاكرة"
          percent={health.memory.percent}
          detail={`${gb(health.memory.usedBytes)} من ${gb(health.memory.totalBytes)} غيغا`}
        />
        <Meter
          icon={HardDrive}
          label="القرص"
          percent={health.disk?.percent ?? null}
          detail={
            health.disk
              ? `${gb(health.disk.totalBytes - health.disk.usedBytes)} غيغا متاحة`
              : 'غير متاح'
          }
        />
      </div>

      <div className="mt-4 grid gap-2 border-t border-zinc-800 pt-3 text-[11px] sm:grid-cols-3">
        <p className="flex items-center gap-1.5 text-zinc-400">
          <Database className="h-3.5 w-3.5" />
          قاعدة البيانات:{' '}
          {health.database.ok ? (
            <span className="text-emerald-400">سليمة ({health.database.ms}ms)</span>
          ) : (
            <span className="text-red-400">لا تستجيب</span>
          )}
        </p>
        <p className="flex items-center gap-1.5 text-zinc-400">
          <Timer className="h-3.5 w-3.5" />
          المهام الدورية:{' '}
          {health.lastJobAgoMinutes !== null ? (
            <span className={jobStale ? 'text-amber-400' : 'text-emerald-400'}>
              {ago(health.lastJobAgoMinutes)}
            </span>
          ) : (
            <span className="text-amber-400">لم تعمل بعد</span>
          )}
        </p>
        <p className="text-zinc-500">
          مُشغَّل منذ{' '}
          {health.uptimeHours < 48
            ? `${health.uptimeHours} ساعة`
            : `${Math.round(health.uptimeHours / 24)} يوماً`}
        </p>
      </div>
    </section>
  );
}
