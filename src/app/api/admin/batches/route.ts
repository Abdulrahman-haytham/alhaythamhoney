import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { batchInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';
import { toBatchData } from '@/lib/batches.server';

export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = batchInput.safeParse(await readJson(request, 64 * 1024));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  try {
    const batch = await db.batch.create({ data: toBatchData(parsed.data) });
    await logAudit({ entity: 'batch', entityId: batch.id, action: 'create', label: batch.code });
    return NextResponse.json({ id: batch.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      return NextResponse.json({ error: 'رمز الدفعة مستخدم.' }, { status: 409 });
    throw error;
  }
}
