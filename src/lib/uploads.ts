import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';

export const MEDIA_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  pdf: 'application/pdf',
};
export const MAX_UPLOAD_BYTES = 64 * 1024 * 1024;
export const mediaDirectory = () =>
  path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'data', 'uploads'), 'studio');
export const isMediaFilename = (name: string) =>
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(jpg|png|webp|avif|mp4|webm|mov|pdf)$/.test(
    name,
  );

/** Check file bytes, not only the user-supplied MIME label. SVG/HTML are never served. */
export function detectMedia(bytes: Buffer): string | null {
  if (bytes.length < 12) return null;
  if (bytes.toString('ascii', 0, 5) === '%PDF-') return 'pdf';
  if (bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) return 'jpg';
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP')
    return 'webp';
  if (bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) return 'webm';
  if (bytes.toString('ascii', 4, 8) === 'ftyp') {
    const brand = bytes.toString('ascii', 8, 12);
    if (['avif', 'avis'].includes(brand)) return 'avif';
    if (brand === 'qt  ') return 'mov';
    if (['isom', 'iso2', 'mp41', 'mp42', 'avc1', 'M4V ', 'MSNV', 'dash'].includes(brand))
      return 'mp4';
  }
  return null;
}

export async function readUploadForm(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data;'))
    throw new Error('صيغة رفع غير صالحة.');
  if (Number(request.headers.get('content-length')) > MAX_UPLOAD_BYTES)
    throw new Error('حجم الرفع أكبر من الحد المسموح.');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('ملف مفقود.');
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_UPLOAD_BYTES) {
        await reader.cancel();
        throw new Error('حجم الرفع أكبر من الحد المسموح.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return new Response(Buffer.concat(chunks), {
    headers: { 'Content-Type': request.headers.get('content-type')! },
  }).formData();
}

export async function saveMedia(file: File) {
  const isVideo = file.type.startsWith('video/');
  if (file.size === 0 || file.size > (isVideo ? 60 : 8) * 1024 * 1024)
    throw new Error('الحد الأقصى 8MB للصورة أو الملف و60MB للفيديو.');
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = detectMedia(bytes);
  if (!ext || MEDIA_TYPES[ext] !== file.type)
    throw new Error('محتوى الملف لا يطابق نوع صورة أو فيديو أو PDF مسموح.');
  const filename = `${randomUUID()}.${ext}`;
  await mkdir(mediaDirectory(), { recursive: true });
  await writeFile(path.join(mediaDirectory(), filename), bytes, { flag: 'wx', mode: 0o640 });
  return {
    filename,
    url: `/uploads/studio/${filename}`,
    type: ext === 'pdf' ? ('FILE' as const) : isVideo ? ('VIDEO' as const) : ('IMAGE' as const),
  };
}

export async function removeMedia(url: string) {
  const filename = url.replace(/^\/uploads\/studio\//, '');
  if (!isMediaFilename(filename)) return;
  await unlink(path.join(mediaDirectory(), filename)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== 'ENOENT') throw error;
  });
}

export function parseRange(header: string, size: number): { start: number; end: number } | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2])) return null;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
  return Number.isSafeInteger(start) &&
    Number.isSafeInteger(end) &&
    start >= 0 &&
    end >= start &&
    start < size
    ? { start, end }
    : null;
}
