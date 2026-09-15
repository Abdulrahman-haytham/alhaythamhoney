import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { pointsAdjustInput } from '@/lib/validation';
import { commerceTransaction, CommerceError } from '@/lib/commerce.server';
import { addPoints } from '@/lib/loyalty.server';
import { logAudit } from '@/lib/audit.server';

/** تعديل يدوي لنقاط زبون (تعويض، مكافأة، تصحيح) مع سبب يظهر له في حسابه */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = pointsAdjustInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  const { id } = await params;
  const customer = await db.customer.findUnique({
    where: { id },
    select: { id: true, name: true, points: true },
  });
  if (!customer) return NextResponse.json({ error: 'الزبون غير موجود.' }, { status: 404 });
  let points: number;
  try {
    points = await commerceTransaction(async (tx) => {
      await addPoints(tx, id, parsed.data.delta, 'ADMIN', { note: parsed.data.note });
      return (await tx.customer.findUniqueOrThrow({ where: { id } })).points;
    });
  } catch (error) {
    if (error instanceof CommerceError)
      return NextResponse.json({ error: error.message }, { status: 400 });
    throw error;
  }
  await logAudit({
    entity: 'customer',
    entityId: id,
    action: 'update',
    label: customer.name,
    before: { points: customer.points },
    after: { points: points, note: parsed.data.note },
  });
  return NextResponse.json({ ok: true, points: points });
}
