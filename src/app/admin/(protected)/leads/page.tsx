import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings.server';
import { LeadsPanel } from './LeadsPanel';

export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage() {
  const [leads, settings] = await Promise.all([
    db.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 300 }),
    getSettings(),
  ]);
  return (
    <>
      <h1 className="mb-3 font-amiri text-3xl font-bold">طلبات الجملة</h1>
      <p className="mb-6 text-sm text-zinc-400">
        كل طلب من صفحة <code className="text-amber-300">/wholesale</code> يصل هنا كفرصة. حرّكها بين
        الحالات وسجّل ملاحظات المكالمات حتى لا تضيع صفقة على واتساب.
        {!settings.wholesaleEnabled && (
          <b className="block text-red-300">الصفحة معطّلة من الإعدادات — لا تستقبل طلبات جديدة.</b>
        )}
      </p>
      <LeadsPanel
        leads={leads.map((l) => ({
          id: l.id,
          name: l.name,
          business: l.business,
          phone: l.phone,
          email: l.email,
          city: l.city,
          quantity: l.quantity,
          message: l.message,
          status: l.status,
          notes: l.notes,
          createdAt: l.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
