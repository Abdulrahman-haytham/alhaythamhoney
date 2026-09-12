import { NextResponse } from 'next/server';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'غير مصرّح.' }, { status: 401 });

  const { id } = await params;

  let photo;
  try {
    photo = await db.studioPhoto.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: 'الصورة غير موجودة.' }, { status: 404 });
  }

  // امسح الملف من القرص أيضاً — لا يفشل الطلب إن تعذّر ذلك (الملف قد يكون غير موجود أصلاً)
  const filename = path.basename(photo.url);
  await unlink(path.join(process.cwd(), 'public', 'uploads', 'studio', filename)).catch(() => {});

  return NextResponse.json({ ok: true });
}
