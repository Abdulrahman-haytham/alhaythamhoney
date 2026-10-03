/**
 * رفع ملف من المتصفح إلى `/api/admin/uploads` على دفعات: لا حدّ لحجم الملف، وانقطاع
 * الشبكة يعيد دفعة واحدة (حتى 5 محاولات) لا الملف كله. `onProgress` من 0 إلى 1.
 */
export type UploadAccept = 'image' | 'media' | 'file';
export interface UploadedMedia {
  url: string;
  type: 'IMAGE' | 'VIDEO' | 'FILE';
}

const ENDPOINT = '/api/admin/uploads';
const RETRIES = 5;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function json(res: Response) {
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

export async function uploadMedia(
  file: File,
  accept: UploadAccept,
  onProgress?: (fraction: number) => void,
): Promise<UploadedMedia> {
  if (file.size === 0) throw new Error('الملف فارغ.');
  onProgress?.(0);
  const started = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'start', size: file.size }),
  }).catch(() => null);
  if (!started) throw new Error('تعذّر الاتصال. تحقق من الإنترنت وحاول مجدداً.');
  const start = await json(started);
  if (!started.ok) throw new Error((start.error as string) || 'تعذّر بدء الرفع.');
  const id = start.id as string;
  const chunkSize = Number(start.chunkSize) || 2 * 1024 * 1024;

  let offset = 0;
  let failures = 0;
  while (offset < file.size) {
    const res = await fetch(`${ENDPOINT}?id=${id}&offset=${offset}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: file.slice(offset, offset + chunkSize),
    }).catch(() => null);
    const data = res ? await json(res) : {};
    if (res?.ok) {
      offset = Number(data.received);
      failures = 0;
      onProgress?.(Math.min(offset / file.size, 0.99));
      continue;
    }
    // وصلت الدفعة ولم يصل الرد: الخادم يخبرنا أين توقّف فنكمل من هناك
    if (res?.status === 409 && typeof data.received === 'number' && ++failures <= RETRIES) {
      offset = data.received;
      continue;
    }
    // أخطاء لا تنفع معها الإعادة (لا مساحة، انتهت الجلسة، غير مصرّح)
    if (res && res.status < 500 && res.status !== 408 && res.status !== 429)
      throw new Error((data.error as string) || 'تعذّر الرفع.');
    if (++failures > RETRIES)
      throw new Error('انقطع الاتصال أثناء الرفع. تحقق من الإنترنت وحاول مجدداً.');
    await wait(1000 * 2 ** (failures - 1));
  }

  const finished = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'finish', id, accept }),
  }).catch(() => null);
  if (!finished) throw new Error('تعذّر الاتصال في آخر الرفع. حاول مجدداً.');
  const done = await json(finished);
  if (!finished.ok) throw new Error((done.error as string) || 'تعذّر حفظ الملف.');
  onProgress?.(1);
  return { url: done.url as string, type: done.type as UploadedMedia['type'] };
}
