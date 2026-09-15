import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { orderStatusInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';
import { CommerceError } from '@/lib/commerce.server';
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
  let after;
  try {
    after = await applyOrderStatus(
      id,
      parsed.data.status,
      parsed.data.notes,
      parsed.data.followUpAt,
      parsed.data.cancellationReason,
      { customerName: parsed.data.customerName, customerPhone: parsed.data.customerPhone },
    );
  } catch (error) {
    if (error instanceof CommerceError)
      return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
  await logAudit({
    entity: 'order',
    entityId: id,
    action: 'status',
    label: before.reference,
    before: {
      status: before.status,
      notes: before.notes,
      customerName: before.customerName,
      customerPhone: before.customerPhone,
      followUpAt: before.followUpAt,
      cancellationReason: before.cancellationReason,
    },
    after: {
      status: after.status,
      notes: after.notes,
      customerName: after.customerName,
      customerPhone: after.customerPhone,
      followUpAt: after.followUpAt,
      cancellationReason: after.cancellationReason,
    },
  });
  return NextResponse.json({ ok: true });
}

/** Orders keep their accounting and audit history; use cancellation instead. */
export async function DELETE(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  return NextResponse.json(
    { error: 'استخدم إلغاء الطلب مع ذكر السبب للحفاظ على السجل وتسوية النقاط.' },
    { status: 405, headers: { Allow: 'PATCH' } },
  );
}
