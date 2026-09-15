'use client';

import { useState } from 'react';
import { Copy, Check, MessageCircle, Users } from 'lucide-react';

/** صندوق «ادعُ صديقاً»: رابط شخصي + نسخ + مشاركة عبر واتساب */
export function ReferralBox({
  link,
  percent,
  count,
}: {
  link: string;
  percent: number;
  count: number;
}) {
  const [copied, setCopied] = useState(false);
  const text = `جرّب عسل الهيثم الطبيعي — سجّل من رابطي وسنحصل كلانا على خصم ${percent}% بعد طلبك الأول: ${link}`;
  return (
    <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-6">
      <h2 className="flex items-center gap-2 font-amiri text-2xl font-bold text-white">
        <Users className="h-5 w-5 text-amber-500" /> ادعُ صديقاً
      </h2>
      <p className="mt-1 mb-4 text-sm text-zinc-400">
        حين يسجّل صديقك من رابطك ويتمّ أول طلب، تحصلان معاً على كوبون {percent}%.
        {count > 0 && <b className="text-amber-300"> دعوت {count} حتى الآن.</b>}
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          readOnly
          value={link}
          dir="ltr"
          aria-label="رابط الدعوة"
          onFocus={(e) => e.currentTarget.select()}
          className="h-10 min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-200"
        />
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(link);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              // المتصفح لا يسمح — الحقل قابل للتحديد يدوياً
            }
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-amber-500/40 px-4 text-sm font-bold text-amber-300 hover:bg-amber-500/10"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'نُسخ' : 'نسخ'}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-green-600 px-4 text-sm font-bold text-white hover:bg-green-500"
        >
          <MessageCircle className="h-4 w-4" /> شارك
        </a>
      </div>
    </div>
  );
}
