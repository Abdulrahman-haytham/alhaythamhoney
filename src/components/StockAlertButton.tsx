'use client';

import { useState } from 'react';
import { BellRing, Check, Loader2 } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/config';
import { trackWhatsAppClick } from '@/lib/analytics';
import { useSettings } from '@/components/SettingsProvider';
import { useCustomer } from '@/components/CustomerProvider';

/**
 * «أعلمني عند التوفر» (Odoo back-in-stock): يسجّل بريداً يُراسَل تلقائياً حين يرفع
 * الأدمن الكمية. إن عطّل الأدمن الميزة يعود الزر إلى رسالة واتساب كما كان.
 */
export default function StockAlertButton({
  productId,
  productName,
  className = '',
  compact = false,
}: {
  productId: string;
  productName: string;
  className?: string;
  compact?: boolean;
}) {
  const { stockAlertsEnabled } = useSettings();
  const customer = useCustomer();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  if (!stockAlertsEnabled) {
    return (
      <a
        href={getWhatsAppLink(`مرحباً، أرجو إعلامي عند توفر ${productName}.`)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick('out-of-stock')}
        className={className}
      >
        <BellRing className="h-4 w-4" />
        أبلغني عند توفره
      </a>
    );
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setState('busy');
    setError('');
    const res = await fetch('/api/stock-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, email: customer?.email ?? email }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok) {
      setState('error');
      setError(data.error || 'تعذّر التسجيل.');
      return;
    }
    setState('done');
  }

  if (state === 'done') {
    return (
      <p className={`${className} cursor-default`}>
        <Check className="h-4 w-4" />
        {compact ? 'سنراسلك' : 'سنراسلك حين يتوفر'}
      </p>
    );
  }

  // زبون مسجّل: ضغطة واحدة بلا نموذج
  if (customer && !open) {
    return (
      <button
        type="button"
        onClick={() => submit()}
        disabled={state === 'busy'}
        className={className}
      >
        {state === 'busy' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <BellRing className="h-4 w-4" />
        )}
        أبلغني عند توفره
      </button>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <BellRing className="h-4 w-4" />
        أبلغني عند توفره
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-1.5">
      <div className="flex gap-1.5">
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="بريدك الإلكتروني"
          dir="ltr"
          aria-label="بريدك الإلكتروني"
          className="h-10 min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === 'busy'}
          className="h-10 shrink-0 rounded-xl bg-amber-500 px-3 text-xs font-bold text-zinc-950 disabled:opacity-50"
        >
          {state === 'busy' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'أبلغني'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}
