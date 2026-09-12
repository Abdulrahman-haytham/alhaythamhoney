import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { productInput } from '@/lib/validation';

export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = productInput.safeParse(await readJson(request, 32 * 1024));
  if (!parsed.success)
    return NextResponse.json({ error: 'تحقق من الحقول ورابط الصورة.' }, { status: 400 });
  try {
    const product = await db.product.create({
      data: { ...parsed.data, detailedInfo: parsed.data.detailedInfo ?? Prisma.DbNull },
    });
    return NextResponse.json({ id: product.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'رابط المنتج مستخدم بالفعل.' }, { status: 409 });
    }
    throw error;
  }
}
