import QRCode from 'qrcode';
import { getWhatsAppStatus } from '@/lib/whatsapp.server';
import { WhatsAppPanel } from './WhatsAppPanel';

export const dynamic = 'force-dynamic';

export default async function AdminWhatsAppPage() {
  const { qr, ...status } = await getWhatsAppStatus();
  const qrImage = qr ? await QRCode.toDataURL(qr, { margin: 1, width: 320 }) : null;
  return (
    <>
      <h1 className="mb-1 font-amiri text-3xl font-bold">واتساب رموز الدخول</h1>
      <p className="mb-6 text-sm text-zinc-400">
        يدخل الزبائن برمز يصلهم على واتساب من رقم آلي مربوط هنا (كما يُربط واتساب ويب). استخدم شريحة
        احتياطية لا رقم المتجر: الربط غير الرسمي قد يعرّض الرقم للحظر. أبقِ هاتف الشريحة مشحوناً
        ومتصلاً بالإنترنت ولو مرة كل أسبوعين حتى لا ينفكّ الربط.
      </p>
      <WhatsAppPanel initial={{ ...status, qrImage }} />
    </>
  );
}
