import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

const ALLOWED_TYPES = Object.keys(EXT_BY_TYPE);
const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_SIZE = 60 * 1024 * 1024; // 60MB

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'غير مصرّح.' }, { status: 401 });

  const photos = await db.studioPhoto.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ photos });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'غير مصرّح.' }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  const caption = (form?.get('caption') as string | null)?.trim() || null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'لم يُرفق ملف.' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'نوع الملف غير مدعوم. المسموح: JPG, PNG, WEBP, AVIF, MP4, WEBM, MOV.' },
      { status: 400 }
    );
  }

  const isVideo = file.type.startsWith('video/');
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `حجم الملف أكبر من الحد المسموح (${maxSize / 1024 / 1024} ميغابايت).` },
      { status: 400 }
    );
  }

  const ext = EXT_BY_TYPE[file.type];
  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'studio');
  await mkdir(uploadDir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), bytes);

  const url = `/uploads/studio/${filename}`;
  const photo = await db.studioPhoto.create({
    data: { url, caption: caption ?? undefined, type: isVideo ? 'VIDEO' : 'IMAGE' },
  });

  return NextResponse.json({ photo }, { status: 201 });
}
