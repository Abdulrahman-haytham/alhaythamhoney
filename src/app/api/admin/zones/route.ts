import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { zoneInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';

export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = zoneInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  try {
    const zone = await db.shippingZone.create({ data: parsed.data });
    await logAudit({ entity: 'zone', entityId: zone.id, action: 'create', label: zone.name });
    return NextResponse.json({ id: zone.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      return NextResponse.json({ error: 'هذه المنطقة موجودة.' }, { status: 409 });
    throw error;
  }
}
