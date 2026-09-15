import { redirect } from 'next/navigation';
import { jarCodeInput } from '@/lib/validation';
import { getJarPassport } from '@/lib/batches.server';

export const dynamic = 'force-dynamic';

/**
 * الرابط المطبوع في QR المرطبان: /j/HY-XXXX-XXXX
 * يفتح جواز الدفعة إن رُبط بها، وإلا صفحة السحب مع الرمز جاهزاً.
 */
export default async function JarCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const parsed = jarCodeInput.safeParse(decodeURIComponent(code));
  if (!parsed.success) redirect('/draw');
  const jar = await getJarPassport(parsed.data);
  if (jar?.passport?.published)
    redirect(`/batch/${jar.passport.code}?jar=${encodeURIComponent(parsed.data)}`);
  redirect(`/draw?code=${encodeURIComponent(parsed.data)}`);
}
