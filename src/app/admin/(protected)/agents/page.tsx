import { db } from '@/lib/db';
import { AgentsPanel } from './AgentsPanel';

export const dynamic = 'force-dynamic';

export default async function AdminAgentsPage() {
  const agents = await db.agent.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
  return (
    <>
      <h1 className="mb-1 font-amiri text-3xl font-bold">الوكلاء المعتمدون</h1>
      <p className="mb-6 text-sm text-zinc-400">
        يظهرون للزوار في صفحة «الوكلاء المعتمدون» ورابطها في القائمة. أضف فقط من يبيع مرطباناتنا
        المختومة؛ وإن توقّف وكيل عن ذلك ألغِ «ظاهر» فيختفي فوراً وتبقى بياناته هنا.
      </p>
      <AgentsPanel
        agents={agents.map((a) => ({
          id: a.id,
          name: a.name,
          governorate: a.governorate,
          city: a.city,
          address: a.address,
          addressDetail: a.addressDetail,
          mapUrl: a.mapUrl,
          whatsapp: a.whatsapp,
          facebookUrl: a.facebookUrl,
          active: a.active,
          sortOrder: a.sortOrder,
        }))}
      />
    </>
  );
}
