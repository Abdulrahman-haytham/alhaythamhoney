import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { leadStatusInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = leadStatusInput.safeParse(await readJson(request));
  if (!parsed.success) return NextResponse.json({ error: 'حالة غير صالحة.' }, { status: 400 });
  const { id } = await params;
  const before = await db.lead.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: 'الطلب غير موجود.' }, { status: 404 });
  const after = await db.lead.update({ where: { id }, data: parsed.data });
  await logAudit({
    entity: 'lead',
    entityId: id,
    action: 'status',
    label: before.business,
    before: { status: before.status, notes: before.notes },
    after: { status: after.status, notes: after.notes },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const existing = await db.lead.findUnique({ where: { id }, select: { business: true } });
  const deleted = await db.lead.deleteMany({ where: { id } });
  if (deleted.count === 0) return NextResponse.json({ error: 'الطلب غير موجود.' }, { status: 404 });
  await logAudit({ entity: 'lead', entityId: id, action: 'delete', label: existing?.business });
  return NextResponse.json({ ok: true });
}
