import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = ['PENDING', 'APPROVED', 'REJECTED'] as const;
type Status = (typeof ALLOWED)[number];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'غير مصرّح.' }, { status: 401 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: string };

  if (!body.status || !ALLOWED.includes(body.status as Status)) {
    return NextResponse.json({ error: 'حالة غير صالحة.' }, { status: 400 });
  }

  try {
    await db.review.update({ where: { id }, data: { status: body.status as Status } });
  } catch {
    return NextResponse.json({ error: 'التقييم غير موجود.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'غير مصرّح.' }, { status: 401 });

  const { id } = await params;
  try {
    await db.review.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: 'التقييم غير موجود.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}