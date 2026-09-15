import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { isRecord, readJson } from '@/lib/request-security';
import { logAudit } from '@/lib/audit.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const body = await readJson(request);
  if (
    !isRecord(body) ||
    (body.status !== 'PENDING' && body.status !== 'APPROVED' && body.status !== 'REJECTED')
  ) {
    return NextResponse.json({ error: 'حالة غير صالحة.' }, { status: 400 });
  }
  const { id } = await params;
  const before = await db.review.findUnique({
    where: { id },
    select: { status: true, authorName: true },
  });
  const result = await db.review.updateMany({ where: { id }, data: { status: body.status } });
  if (result.count)
    await logAudit({
      entity: 'review',
      entityId: id,
      action: 'status',
      label: before?.authorName,
      before: { status: before?.status },
      after: { status: body.status },
    });
  return result.count
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: 'التقييم غير موجود.' }, { status: 404 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const result = await db.review.deleteMany({ where: { id } });
  if (result.count) await logAudit({ entity: 'review', entityId: id, action: 'delete' });
  return result.count
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: 'التقييم غير موجود.' }, { status: 404 });
}
