import { NextResponse } from 'next/server';
import { z } from 'zod';
import { guardAdmin } from '@/lib/admin-request';
import { rateLimit } from '@/lib/rate-limit';
import { readJson } from '@/lib/request-security';
import { appendChunk, finishUpload, startUpload, UploadError, type MediaKind } from '@/lib/uploads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * رفع ملفات لوحة التحكم كلها (صور المنتجات والمقالات، لقطات الاستديو، تقارير المخبر)
 * على دفعات صغيرة قابلة للاستئناف — انظر `@/lib/uploads`:
 *   POST {action:"start", size}            → {id, chunkSize}
 *   PUT  ?id=&offset=   (جسم الطلب = الدفعة) → {received}
 *   POST {action:"finish", id, accept}     → {url, type}
 */
const ACCEPT: Record<string, readonly MediaKind[]> = {
  image: ['IMAGE'],
  media: ['IMAGE', 'VIDEO'],
  file: ['FILE'],
};

const actionInput = z.discriminatedUnion('action', [
  z.object({ action: z.literal('start'), size: z.number().int().positive() }).strict(),
  z
    .object({
      action: z.literal('finish'),
      id: z.string().uuid(),
      accept: z.enum(['image', 'media', 'file']),
    })
    .strict(),
]);

function failure(error: unknown) {
  if (error instanceof UploadError)
    return NextResponse.json(
      { error: error.message, received: error.received },
      { status: error.status },
    );
  console.error('[upload] failed', error);
  return NextResponse.json({ error: 'تعذّر الرفع. حاول مجدداً.' }, { status: 500 });
}

export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = actionInput.safeParse(await readJson(request));
  if (!parsed.success) return NextResponse.json({ error: 'طلب رفع غير صالح.' }, { status: 400 });
  try {
    if (parsed.data.action === 'start') {
      // الحدّ على عدد الملفات لا الدفعات، وسخيّ: جلسة تصوير كاملة تُرفع دفعة واحدة
      const limited = await rateLimit(request, 'admin-upload', 600, 3600);
      if (limited) return limited;
      return NextResponse.json(await startUpload(parsed.data.size), { status: 201 });
    }
    const media = await finishUpload(parsed.data.id, ACCEPT[parsed.data.accept]);
    return NextResponse.json({ url: media.url, type: media.type }, { status: 201 });
  } catch (error) {
    return failure(error);
  }
}

export async function PUT(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const url = new URL(request.url);
  const id = url.searchParams.get('id') ?? '';
  const offset = Number(url.searchParams.get('offset'));
  if (!request.body || !Number.isSafeInteger(offset) || offset < 0)
    return NextResponse.json({ error: 'طلب رفع غير صالح.' }, { status: 400 });
  try {
    return NextResponse.json({ received: await appendChunk(id, offset, request.body) });
  } catch (error) {
    return failure(error);
  }
}
