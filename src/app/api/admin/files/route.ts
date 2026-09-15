import { NextResponse } from 'next/server';
import { guardAdmin } from '@/lib/admin-request';
import { rateLimit } from '@/lib/rate-limit';
import { readUploadForm, saveMedia, removeMedia } from '@/lib/uploads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** رفع ملف PDF (تقرير مخبر لجواز الدفعة) — يُخزَّن مع ملفات الاستديو ويُخدَم من /uploads/studio */
export async function POST(request: Request) {
  const denied = (await guardAdmin(request)) || (await rateLimit(request, 'admin-file', 40, 3600));
  if (denied) return denied;
  try {
    const form = await readUploadForm(request);
    const file = form.get('file');
    if (!(file instanceof File)) throw new Error('لم يرفق ملف.');
    const media = await saveMedia(file);
    if (media.type !== 'FILE') {
      await removeMedia(media.url).catch(() => {});
      throw new Error('هذا الرفع لملفات PDF فقط.');
    }
    return NextResponse.json({ url: media.url }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ملف غير صالح.' },
      { status: 400 },
    );
  }
}
