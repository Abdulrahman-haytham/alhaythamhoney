import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { guardAdmin } from '@/lib/admin-request';
import { rateLimit } from '@/lib/rate-limit';
import { readUploadForm, saveMedia, removeMedia } from '@/lib/uploads';
import { studioTagInput } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'غير مصرّح.' }, { status: 401 });
  const photos = await db.studioPhoto.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ photos });
}

export async function POST(request: Request) {
  const denied =
    (await guardAdmin(request)) || (await rateLimit(request, 'studio-upload', 20, 3600));
  if (denied) return denied;
  let media;
  let caption: string | null;
  let tag: string | null = null;
  try {
    const form = await readUploadForm(request);
    const file = form.get('file');
    const rawCaption = form.get('caption');
    caption = typeof rawCaption === 'string' ? rawCaption.trim().slice(0, 500) || null : null;
    const rawTag = form.get('tag');
    if (typeof rawTag === 'string' && rawTag) {
      const parsedTag = studioTagInput.safeParse(rawTag);
      if (!parsedTag.success) throw new Error('وسم خطوة القطاف غير معروف.');
      tag = parsedTag.data;
    }
    if (!(file instanceof File)) throw new Error('لم يرفق ملف.');
    media = await saveMedia(file);
    if (media.type === 'FILE') {
      await removeMedia(media.url).catch(() => {});
      throw new Error('الاستديو للصور والفيديو فقط.');
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ملف غير صالح.' },
      { status: 400 },
    );
  }
  try {
    const photo = await db.studioPhoto.create({
      data: { url: media.url, type: media.type === 'VIDEO' ? 'VIDEO' : 'IMAGE', caption, tag },
    });
    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    await removeMedia(media.url).catch(() => {});
    throw error;
  }
}
