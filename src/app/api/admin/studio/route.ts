import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { removeMedia, uploadedMediaKind } from '@/lib/uploads';
import { studioCreateInput } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'غير مصرّح.' }, { status: 401 });
  const photos = await db.studioPhoto.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ photos });
}

/**
 * يسجّل لقطة في معرض الاستديو. الملف نفسه رُفع قبلها على دفعات عبر `/api/admin/uploads`
 * (بلا حدّ للحجم)؛ هنا نتأكد فقط أنه موجود وأنه صورة أو فيديو.
 */
export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = studioCreateInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json({ error: 'بيانات اللقطة غير صالحة.' }, { status: 400 });
  const { url, caption, tag } = parsed.data;
  const kind = await uploadedMediaKind(url);
  if (kind !== 'IMAGE' && kind !== 'VIDEO')
    return NextResponse.json({ error: 'الملف غير موجود — أعد رفعه.' }, { status: 400 });
  try {
    const photo = await db.studioPhoto.create({
      data: { url, type: kind, caption: caption ?? null, tag: tag ?? null },
    });
    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    await removeMedia(url).catch(() => {});
    throw error;
  }
}
