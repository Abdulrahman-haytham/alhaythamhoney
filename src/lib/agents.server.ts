import 'server-only';
import { db } from '@/lib/db';

export interface AgentCard {
  id: string;
  name: string;
  governorate: string;
  city: string;
  address: string;
  addressDetail: string | null;
  mapUrl: string | null;
  whatsapp: string | null;
  facebookUrl: string | null;
}

/** الوكلاء الفعّالون بترتيب الأدمن — ما يراه الزائر في /agents */
export async function getActiveAgents(): Promise<AgentCard[]> {
  return db.agent.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      name: true,
      governorate: true,
      city: true,
      address: true,
      addressDetail: true,
      mapUrl: true,
      whatsapp: true,
      facebookUrl: true,
    },
  });
}
