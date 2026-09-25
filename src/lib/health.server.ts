import 'server-only';
import { cpus, freemem, loadavg, totalmem, uptime } from 'node:os';
import { readFile, stat, statfs, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { db } from '@/lib/db';

const UPLOAD_DIR = process.env.UPLOAD_DIR || process.cwd();
/** أثر آخر تشغيل للمهام الدورية — ملف في المجلد الدائم، بلا جدول جديد في القاعدة */
const CRON_STAMP = path.join(UPLOAD_DIR, '.last-cron-run');

/** تكتبه نقطة /api/cron بعد كل دورة ناجحة. */
export async function markCronRun() {
  await writeFile(CRON_STAMP, new Date().toISOString(), 'utf8').catch(() => null);
}

/**
 * نسبة انشغال المعالج من /proc/stat: نأخذ لقطتين بينهما فاصل قصير ونقيس الفرق.
 * متوسط الحمل وحده لا يكفي — يقيس طول الطابور لا النسبة المئوية.
 */
async function cpuBusyPercent(sampleMs = 120): Promise<number | null> {
  const read = async () => {
    try {
      const line = (await readFile('/proc/stat', 'utf8')).split('\n')[0];
      const parts = line.split(/\s+/).slice(1).filter(Boolean).map(Number);
      if (parts.length < 4) return null;
      const idle = parts[3] + (parts[4] ?? 0);
      return { idle, total: parts.reduce((a, b) => a + b, 0) };
    } catch {
      return null;
    }
  };
  const a = await read();
  if (!a) return null;
  await new Promise((r) => setTimeout(r, sampleMs));
  const b = await read();
  if (!b || b.total === a.total) return null;
  return Math.max(
    0,
    Math.min(100, Math.round((1 - (b.idle - a.idle) / (b.total - a.total)) * 100)),
  );
}

export interface ServerHealth {
  cpu: { percent: number | null; cores: number; load1: number };
  memory: { usedBytes: number; totalBytes: number; percent: number };
  disk: { usedBytes: number; totalBytes: number; percent: number } | null;
  uptimeHours: number;
  database: { ok: boolean; ms: number | null };
  /** آخر تشغيل ناجح للمهام الدورية — null يعني أنها لم تعمل بعد */
  lastJobRun: Date | null;
  /** يُحسب على الخادم: قراءة الوقت أثناء التصيير تجعل المكوّن غير نقي */
  lastJobAgoMinutes: number | null;
}

/**
 * حالة الخادم كما يراها التطبيق. داخل Docker بلا حدود موارد تعكس هذه القيم
 * أرقام المضيف الحقيقية (تحقّقنا من ذلك مقابل `free` و`df` على الخادم).
 */
export async function getServerHealth(): Promise<ServerHealth> {
  const total = totalmem();
  const free = freemem();

  const [cpuPercent, diskStat, dbPing] = await Promise.all([
    cpuBusyPercent(),
    statfs(UPLOAD_DIR).catch(() => null),
    (async () => {
      const started = Date.now();
      try {
        await db.$queryRaw`SELECT 1`;
        return { ok: true, ms: Date.now() - started };
      } catch {
        return { ok: false, ms: null };
      }
    })(),
  ]);

  const disk = diskStat
    ? (() => {
        const totalBytes = diskStat.blocks * diskStat.bsize;
        const usedBytes = totalBytes - diskStat.bavail * diskStat.bsize;
        return {
          totalBytes,
          usedBytes,
          percent: totalBytes ? Math.round((usedBytes / totalBytes) * 100) : 0,
        };
      })()
    : null;

  const lastJobRun = await stat(CRON_STAMP)
    .then((s) => s.mtime)
    .catch(() => null);

  return {
    cpu: { percent: cpuPercent, cores: cpus().length, load1: Number(loadavg()[0].toFixed(2)) },
    memory: {
      usedBytes: total - free,
      totalBytes: total,
      percent: total ? Math.round(((total - free) / total) * 100) : 0,
    },
    disk,
    uptimeHours: Math.round(uptime() / 360) / 10,
    database: dbPing,
    lastJobRun,
    lastJobAgoMinutes: lastJobRun
      ? Math.max(0, Math.round((Date.now() - lastJobRun.getTime()) / 60_000))
      : null,
  };
}
