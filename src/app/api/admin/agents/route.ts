import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { agentInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';

export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = agentInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  const agent = await db.agent.create({ data: parsed.data });
  await logAudit({ entity: 'agent', entityId: agent.id, action: 'create', label: agent.name });
  return NextResponse.json({ id: agent.id }, { status: 201 });
}
