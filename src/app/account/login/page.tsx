import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentCustomer } from '@/lib/customer-auth';
import { LoginFlow } from './LoginFlow';

export const metadata: Metadata = {
  title: 'تسجيل الدخول',
  description: 'ادخل إلى حسابك في الهيثم برمز يُرسل إلى بريدك — بلا كلمة مرور.',
  robots: { index: false },
};
export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // لا نسمح إلا بمسارات داخلية حتى لا يُستغل الرابط للتحويل إلى موقع خارجي
  const safeNext = next && /^\/(?!\/)[^\s]*$/.test(next) ? next : '/account';
  if (await currentCustomer()) redirect(safeNext);
  return (
    <section className="min-h-screen bg-zinc-950 px-4 pt-32 pb-20 sm:px-6">
      <div className="mx-auto max-w-md">
        <LoginFlow next={safeNext} />
      </div>
    </section>
  );
}
