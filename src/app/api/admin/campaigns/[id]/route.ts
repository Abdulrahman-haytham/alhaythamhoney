import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { campaignInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = campaignInput.safeParse(await readJson(request, 256 * 1024));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  const { id } = await params;
  const before = await db.campaign.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: 'الحملة غير موجودة.' }, { status: 404 });
  if (before.status !== 'DRAFT')
    return NextResponse.json({ error: 'لا تُعدَّل حملة بدأ إرسالها.' }, { status: 400 });
  const changed = await db.campaign.updateMany({
    where: { id, status: 'DRAFT' },
    data: parsed.data,
  });
  if (!changed.count)
    return NextResponse.json({ error: 'بدأ إرسال الحملة؛ لا يمكن تعديلها.' }, { status: 409 });
  const after = { ...before, ...parsed.data };
  await logAudit({
    entity: 'campaign',
    entityId: id,
    action: 'update',
    label: after.subject,
    before,
    after,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const existing = await db.campaign.findUnique({ where: { id }, select: { subject: true } });
  const deleted = await db.campaign.deleteMany({ where: { id, status: 'DRAFT' } });
  if (deleted.count === 0)
    return NextResponse.json({ error: 'يمكن حذف المسودات فقط.' }, { status: 409 });
  await logAudit({ entity: 'campaign', entityId: id, action: 'delete', label: existing?.subject });
  return NextResponse.json({ ok: true });
}
