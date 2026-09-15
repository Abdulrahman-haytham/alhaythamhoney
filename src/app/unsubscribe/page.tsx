import type { Metadata } from 'next';
import Link from 'next/link';
import { MailX } from 'lucide-react';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'إلغاء الاشتراك', robots: { index: false } };
export const dynamic = 'force-dynamic';

/** رابط إلغاء الاشتراك في كل حملة — ضغطة واحدة بلا تسجيل دخول */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  let done = false;
  if (t && /^[a-f0-9]{32}$/.test(t)) {
    const r = await db.customer.updateMany({
      where: { unsubscribeToken: t },
      data: { marketingOptIn: false },
    });
    done = r.count > 0;
  }
  return (
    <section className="min-h-screen bg-zinc-950 px-4 pt-32 pb-20 sm:px-6">
      <div className="mx-auto max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
        <MailX className="mx-auto mb-4 h-10 w-10 text-amber-500" />
        <h1 className="font-amiri text-2xl font-bold text-white">
          {done ? 'تم إلغاء اشتراكك' : 'الرابط غير صالح'}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {done
            ? 'لن تصلك رسائل العروض بعد الآن. يمكنك إعادة تفعيلها من صفحة حسابك متى شئت.'
            : 'افتح الرابط من الرسالة نفسها، أو عدّل تفضيلاتك من صفحة حسابك.'}
        </p>
        <Link
          href="/account"
          className="mt-6 inline-block rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-zinc-950"
        >
          حسابي
        </Link>
      </div>
    </section>
  );
}
