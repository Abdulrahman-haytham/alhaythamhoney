'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, KeyRound, UserRound, Loader2, ArrowRight } from 'lucide-react';
import { clearStoredReferral, storedReferral } from '@/components/ReferralCapture';

type Step = 'email' | 'code' | 'profile';
const inputClass =
  'mt-1 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-base text-white placeholder:text-zinc-600 focus:border-amber-500/60 focus:outline-none';

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'حدث خطأ. حاول مجدداً.');
  return data;
}

/**
 * دخول بلا كلمة مرور: بريد → رمز 6 أرقام → (للجديد فقط) الاسم والهاتف.
 * البريد للرمز، والهاتف للتوصيل والتواصل.
 */
export function LoginFlow({ next }: { next: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [optIn, setOptIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذّر الاتصال.');
    } finally {
      setBusy(false);
    }
  }

  const finish = () => {
    router.push(next);
    router.refresh();
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-500">
          {step === 'email' ? (
            <Mail className="h-7 w-7" />
          ) : step === 'code' ? (
            <KeyRound className="h-7 w-7" />
          ) : (
            <UserRound className="h-7 w-7" />
          )}
        </div>
        <h1 className="font-amiri text-3xl font-bold text-white">
          {step === 'email'
            ? 'تسجيل الدخول'
            : step === 'code'
              ? 'أدخل الرمز'
              : 'أهلاً بك! عرّفنا بنفسك'}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {step === 'email' && 'بلا كلمة مرور — نرسل رمزاً إلى بريدك في كل مرة.'}
          {step === 'code' && (
            <>
              أرسلنا 6 أرقام إلى <b className="text-zinc-200">{email}</b>. تحقق من صندوق الوارد (أو
              البريد غير المرغوب).
            </>
          )}
          {step === 'profile' && 'مرة واحدة فقط: اسمك للتواصل، وهاتفك للتوصيل.'}
        </p>
      </div>

      {step === 'email' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              await post('/api/auth/request-code', { email });
              setStep('code');
            });
          }}
          className="space-y-4"
        >
          <label className="block text-sm text-zinc-300">
            البريد الإلكتروني
            <input
              className={inputClass}
              type="email"
              dir="ltr"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>
          <SubmitButton busy={busy}>أرسل الرمز</SubmitButton>
        </form>
      )}

      {step === 'code' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              const data = await post('/api/auth/verify', { email, code });
              if (data.needsProfile) {
                setToken(data.token);
                setStep('profile');
              } else finish();
            });
          }}
          className="space-y-4"
        >
          <label className="block text-sm text-zinc-300">
            رمز الدخول
            <input
              className={`${inputClass} text-center text-2xl tracking-[0.5em] font-bold`}
              dir="ltr"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
            />
          </label>
          <SubmitButton busy={busy}>دخول</SubmitButton>
          <div className="flex justify-between text-xs text-zinc-500">
            <button
              type="button"
              onClick={() =>
                run(async () => void (await post('/api/auth/request-code', { email })))
              }
              className="hover:text-amber-400"
              disabled={busy}
            >
              أعد إرسال الرمز
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setCode('');
              }}
              className="inline-flex items-center gap-1 hover:text-amber-400"
            >
              <ArrowRight className="h-3 w-3" /> غيّر البريد
            </button>
          </div>
        </form>
      )}

      {step === 'profile' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              await post('/api/auth/register', {
                token,
                name,
                phone,
                city: city || null,
                marketingOptIn: optIn,
                ref: storedReferral(),
              });
              clearStoredReferral();
              finish();
            });
          }}
          className="space-y-4"
        >
          <label className="block text-sm text-zinc-300">
            الاسم الكامل
            <input
              className={inputClass}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={80}
              autoFocus
            />
          </label>
          <label className="block text-sm text-zinc-300">
            رقم الهاتف (للتوصيل)
            <input
              className={inputClass}
              type="tel"
              dir="ltr"
              autoComplete="tel"
              inputMode="tel"
              placeholder="09xx xxx xxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm text-zinc-300">
            المدينة (اختياري)
            <input
              className={inputClass}
              autoComplete="address-level2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              maxLength={40}
            />
          </label>
          <label className="flex items-start gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={optIn}
              onChange={(e) => setOptIn(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-amber-500"
            />
            أوافق على استلام العروض ونتائج السحب على واتساب أو البريد.
          </label>
          <SubmitButton busy={busy}>إنشاء الحساب</SubmitButton>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

function SubmitButton({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <button
      disabled={busy}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 font-bold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-60"
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
