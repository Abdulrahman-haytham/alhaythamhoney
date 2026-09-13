import { NextResponse } from 'next/server';
import { guardAdmin } from '@/lib/admin-request';
import { rateLimit } from '@/lib/rate-limit';
import { readUploadForm, saveMedia, removeMedia } from '@/lib/uploads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * رفع صورة عامة للوحة التحكم (غلاف مقال، صورة داخل النص، خلفية الهيرو…). تُخزَّن في مجلد الاستديو نفسه
 * وتُخدَم من /uploads/studio لكنها لا تُدرج في معرض الاستديو.
 */
export async function POST(request: Request) {
  const denied = (await guardAdmin(request)) || (await rateLimit(request, 'admin-image', 40, 3600));
  if (denied) return denied;
  try {
    const form = await readUploadForm(request);
    const file = form.get('file');
    if (!(file instanceof File)) throw new Error('لم يرفق ملف.');
    const media = await saveMedia(file);
    if (media.type !== 'IMAGE') {
      await removeMedia(media.url).catch(() => {});
      throw new Error('هذا الرفع للصور فقط.');
    }
    return NextResponse.json({ url: media.url }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ملف غير صالح.' },
      { status: 400 },
    );
  }
}
