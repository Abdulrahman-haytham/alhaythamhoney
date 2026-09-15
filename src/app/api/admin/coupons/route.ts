import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { couponInput } from '@/lib/validation';
import { toCouponData } from '@/lib/coupons.server';
import { logAudit } from '@/lib/audit.server';

export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = couponInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  try {
    const coupon = await db.coupon.create({ data: toCouponData(parsed.data) });
    await logAudit({ entity: 'coupon', entityId: coupon.id, action: 'create', label: coupon.code });
    return NextResponse.json({ id: coupon.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      return NextResponse.json({ error: 'هذا الكود مستخدم بالفعل.' }, { status: 409 });
    throw error;
  }
}
