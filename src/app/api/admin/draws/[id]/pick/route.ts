import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { pickWinner } from '@/lib/draws.server';

/** اختيار الفائز عشوائياً وإغلاق السحب. لا يُعاد السحب بعد الإعلان. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const draw = await db.draw.findUnique({ where: { id }, select: { status: true } });
  if (!draw) return NextResponse.json({ error: 'السحب غير موجود.' }, { status: 404 });
  if (draw.status === 'DRAWN')
    return NextResponse.json({ error: 'أُعلن الفائز مسبقاً.' }, { status: 400 });
  const winnerId = await pickWinner(id);
  if (!winnerId) return NextResponse.json({ error: 'لا مشاركات في هذا السحب.' }, { status: 400 });
  return NextResponse.json({ ok: true, winnerEntryId: winnerId });
}
