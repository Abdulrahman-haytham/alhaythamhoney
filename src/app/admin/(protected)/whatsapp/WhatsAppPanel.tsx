'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  QrCode,
  Smartphone,
  Unlink,
  Send,
  AlertTriangle,
} from 'lucide-react';

interface Status {
  status: 'unlinked' | 'linking' | 'connecting' | 'open' | 'offline';
  me: string | null;
  qrImage: string | null;
  pairingCode: string | null;
  mode: 'qr' | 'code' | null;
  lastError: string | null;
  lastErrorAt: string | null;
  connectedAt: string | null;
  sent: number;
  failed: number;
}

const inputClass =
  'mt-1 h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-base text-white placeholder:text-zinc-600 focus:border-amber-500/60 focus:outline-none';

const LABEL: Record<Status['status'], { text: string; tone: string }> = {
  open: {
    text: 'متصل — الرموز تُرسل',
    tone: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  },
  connecting: { text: 'يعيد الاتصال…', tone: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
  linking: {
    text: 'بانتظار الربط من الهاتف',
    tone: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  },
  unlinked: {
    text: 'غير مربوط — الدخول متوقف',
    tone: 'border-red-500/30 bg-red-500/10 text-red-300',
  },
  offline: { text: 'البوابة لا تعمل', tone: 'border-red-500/30 bg-red-500/10 text-red-300' },
};

const formatTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('ar-SY-u-nu-latn', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Damascus',
      })
    : '';

/** الرقم الدولي بلا + ← 0944 123 456 */
const showNumber = (n: string | null) =>
  !n ? '' : /^9639\d{8}$/.test(n) ? `0${n.slice(3, 6)} ${n.slice(6, 9)} ${n.slice(9)}` : `+${n}`;

export function WhatsAppPanel({ initial }: { initial: Status }) {
  const [s, setS] = useState<Status>(initial);
  const [phone, setPhone] = useState('');
  const [testTo, setTestTo] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/admin/whatsapp', { cache: 'no-store' }).catch(() => null);
    if (res?.ok) setS(await res.json());
  }, []);

  // أثناء الربط يتجدّد رمز QR كل ~20 ثانية — نتابع حتى يكتمل
  useEffect(() => {
    if (s.status !== 'linking' && s.status !== 'connecting') return;
    const t = setInterval(refresh, 2500);
    return () => clearInterval(t);
  }, [s.status, refresh]);

  async function act(action: string, body: Record<string, unknown> = {}) {
    setBusy(action);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'تعذّر الطلب.');
      if (data.status) setS(data);
      if (action === 'test')
        setMessage({ ok: true, text: 'أُرسلت رسالة التجربة — تحقّق من الهاتف.' });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : 'تعذّر الطلب.' });
    } finally {
      setBusy(null);
    }
  }

  const label = LABEL[s.status];
  const canLink = s.status === 'unlinked' || s.status === 'linking';

  return (
    <div className="space-y-5">
      <div className={`flex flex-wrap items-center gap-3 rounded-2xl border p-4 ${label.tone}`}>
        {s.status === 'open' ? (
          <CheckCircle2 className="h-6 w-6 shrink-0" />
        ) : s.status === 'linking' || s.status === 'connecting' ? (
          <Loader2 className="h-6 w-6 shrink-0 animate-spin" />
        ) : (
          <AlertTriangle className="h-6 w-6 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-bold">{label.text}</p>
          {s.me && (
            <p className="text-sm opacity-80" dir="ltr">
              {showNumber(s.me)}
            </p>
          )}
          {s.status === 'open' && (
            <p className="text-xs opacity-70">
              منذ {formatTime(s.connectedAt)} · أُرسل {s.sent} · فشل {s.failed}
            </p>
          )}
        </div>
      </div>

      {s.lastError && s.status !== 'open' && (
        <p className="rounded-lg bg-zinc-900 px-3 py-2 text-xs text-zinc-400">
          آخر مشكلة ({formatTime(s.lastErrorAt)}): {s.lastError}
        </p>
      )}

      {s.status === 'linking' && (s.pairingCode || s.qrImage) && (
        <div className="rounded-2xl border border-amber-500/30 bg-zinc-900/60 p-5 text-center">
          {s.pairingCode ? (
            <>
              <p className="text-sm text-zinc-300">اكتب هذا الرمز في هاتف الرقم الآلي:</p>
              <p
                className="my-3 font-mono text-4xl font-black tracking-[0.25em] text-amber-300"
                dir="ltr"
              >
                {s.pairingCode.slice(0, 4)}-{s.pairingCode.slice(4)}
              </p>
              <p className="text-xs text-zinc-500">
                واتساب ← الإعدادات ← الأجهزة المرتبطة ← ربط جهاز ← «الربط برقم الهاتف بدلاً من ذلك».
              </p>
            </>
          ) : (
            s.qrImage && (
              <>
                <p className="mb-3 text-sm text-zinc-300">امسح الرمز من هاتف الرقم الآلي:</p>
                <img
                  src={s.qrImage}
                  alt="رمز QR لربط واتساب"
                  className="mx-auto h-64 w-64 rounded-xl bg-white p-2"
                />
                <p className="mt-3 text-xs text-zinc-500">
                  واتساب ← الإعدادات ← الأجهزة المرتبطة ← ربط جهاز. يتجدّد الرمز تلقائياً.
                </p>
              </>
            )
          )}
        </div>
      )}

      {canLink && (
        <div className="grid gap-4 sm:grid-cols-2">
          <form
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              void act('link-code', { phone });
            }}
          >
            <p className="flex items-center gap-2 font-bold text-white">
              <Smartphone className="h-5 w-5 text-amber-500" /> الربط برمز
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              الأنسب من الجوال: يظهر رمز من 8 أحرف تكتبه في هاتف الرقم الآلي.
            </p>
            <label className="mt-3 block text-xs text-zinc-300">
              رقم الشريحة الآلية
              <input
                className={inputClass}
                type="tel"
                dir="ltr"
                inputMode="tel"
                placeholder="09xx xxx xxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </label>
            <button
              disabled={busy !== null}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-amber-500 font-bold text-zinc-950 disabled:opacity-60"
            >
              {busy === 'link-code' && <Loader2 className="h-4 w-4 animate-spin" />}
              أظهر رمز الربط
            </button>
          </form>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="flex items-center gap-2 font-bold text-white">
              <QrCode className="h-5 w-5 text-amber-500" /> الربط بمسح QR
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              افتح هذه الصفحة على جهاز آخر، وامسح الرمز بهاتف الرقم الآلي.
            </p>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => act('link-qr')}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-amber-500/40 font-bold text-amber-300 disabled:opacity-60"
            >
              {busy === 'link-qr' && <Loader2 className="h-4 w-4 animate-spin" />}
              أظهر رمز QR
            </button>
          </div>
        </div>
      )}

      {s.status === 'open' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <form
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              void act('test', { phone: testTo });
            }}
          >
            <p className="flex items-center gap-2 font-bold text-white">
              <Send className="h-5 w-5 text-amber-500" /> رسالة تجربة
            </p>
            <label className="mt-3 block text-xs text-zinc-300">
              إلى رقم (رقمك الشخصي مثلاً)
              <input
                className={inputClass}
                type="tel"
                dir="ltr"
                inputMode="tel"
                placeholder="09xx xxx xxx"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                required
              />
            </label>
            <button
              disabled={busy !== null}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-amber-500 font-bold text-zinc-950 disabled:opacity-60"
            >
              {busy === 'test' && <Loader2 className="h-4 w-4 animate-spin" />}
              أرسل
            </button>
          </form>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="flex items-center gap-2 font-bold text-white">
              <Unlink className="h-5 w-5 text-red-400" /> فك الربط
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              يتوقف إرسال الرموز فوراً حتى تربط رقماً آخر.
            </p>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => {
                if (window.confirm('فك ربط الرقم الآلي؟ سيتوقف تسجيل الدخول.')) void act('unlink');
              }}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-500/40 font-bold text-red-300 disabled:opacity-60"
            >
              {busy === 'unlink' && <Loader2 className="h-4 w-4 animate-spin" />}
              فك الربط
            </button>
          </div>
        </div>
      )}

      {message && (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${message.ok ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
