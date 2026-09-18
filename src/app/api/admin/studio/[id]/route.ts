import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { removeMedia } from '@/lib/uploads';
import { readJson } from '@/lib/request-security';
import { studioPatchInput } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const photo = await db.studioPhoto.findUnique({ where: { id } });
  if (!photo) return NextResponse.json({ error: 'الصورة غير موجودة.' }, { status: 404 });
  const used =
    (await db.product.count({ where: { image: photo.url } })) +
    (await db.mixture.count({ where: { image: photo.url } }));
  if (used)
    return NextResponse.json(
      { error: 'هذه الصورة مستخدمة في منتج أو خلطة. غيّر صورتها أولاً.' },
      { status: 409 },
    );
  await removeMedia(photo.url);
  await db.studioPhoto.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

/** تعديل وصف اللقطة أو وسم خطوة القطاف — تظهر الموسومة في «هكذا نعمل» على /beekeeping/harvest. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = studioPatchInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  const { id } = await params;
  const updated = await db.studioPhoto.updateMany({ where: { id }, data: parsed.data });
  if (updated.count === 0)
    return NextResponse.json({ error: 'الصورة غير موجودة.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
