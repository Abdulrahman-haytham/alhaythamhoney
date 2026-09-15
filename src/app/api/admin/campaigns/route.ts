import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { campaignInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';

export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = campaignInput.safeParse(await readJson(request, 256 * 1024));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  const campaign = await db.campaign.create({ data: parsed.data });
  await logAudit({
    entity: 'campaign',
    entityId: campaign.id,
    action: 'create',
    label: campaign.subject,
  });
  return NextResponse.json({ id: campaign.id }, { status: 201 });
}
