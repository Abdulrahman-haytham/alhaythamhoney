import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { orderStatusInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';
import { applyOrderStatus } from '@/lib/orders.server';

/** تغيير حالة الطلب وملاحظاته — التأكيد الأول يثبّت تاريخ التأكيد ويُطلق مكافآت الولاء. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = orderStatusInput.safeParse(await readJson(request));
  if (!parsed.success) return NextResponse.json({ error: 'حالة غير صالحة.' }, { status: 400 });
  const { id } = await params;
  const before = await db.order.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: 'الطلب غير موجود.' }, { status: 404 });
  const after = await applyOrderStatus(before, parsed.data.status, parsed.data.notes);
  await logAudit({
    entity: 'order',
    entityId: id,
    action: 'status',
    label: before.reference,
    before: { status: before.status, notes: before.notes },
    after: { status: after.status, notes: after.notes },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const existing = await db.order.findUnique({ where: { id }, select: { reference: true } });
  const deleted = await db.order.deleteMany({ where: { id } });
  if (deleted.count === 0) return NextResponse.json({ error: 'الطلب غير موجود.' }, { status: 404 });
  await logAudit({ entity: 'order', entityId: id, action: 'delete', label: existing?.reference });
  return NextResponse.json({ ok: true });
}
