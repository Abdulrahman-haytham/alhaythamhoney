import { randomUUID } from 'node:crypto';
import {
  appendFile,
  chmod,
  mkdir,
  open,
  readdir,
  rename,
  stat,
  statfs,
  unlink,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

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
    if (
      /^(isom|iso[2-9]|mp41|mp42|mp71|avc1|hvc1|hev1|M4V |M4VH|M4VP|MSNV|dash|3gp[4-9])$/.test(
        brand,
      )
    )
      return 'mp4';
  }
  return null;
}

export type MediaKind = 'IMAGE' | 'VIDEO' | 'FILE';
const KIND_OF: Record<string, MediaKind> = {
  jpg: 'IMAGE',
  png: 'IMAGE',
  webp: 'IMAGE',
  avif: 'IMAGE',
  mp4: 'VIDEO',
  webm: 'VIDEO',
  mov: 'VIDEO',
  pdf: 'FILE',
};

/**
 * الرفع على دفعات قابلة للاستئناف، بلا حدّ لحجم الملف:
 *   startUpload → appendChunk × n → finishUpload
 * كل دفعة طلب صغير مستقل، فانقطاع الشبكة يعيد دفعة واحدة لا الملف كله، ولا يُحمَّل
 * الملف في الذاكرة أبداً. الحدّ الوحيد هو القرص: نُبقي هامشاً حرّاً حتى لا يتوقف
 * الموقع وقاعدة البيانات بسبب فيديو.
 */
export const CHUNK_BYTES = 2 * 1024 * 1024;
const MAX_CHUNK_BYTES = 16 * 1024 * 1024;
const DISK_RESERVE_BYTES = Number(process.env.UPLOAD_DISK_RESERVE_MB || 5120) * 1024 * 1024;
const STALE_PART_MS = 48 * 3600 * 1000;
/** الصورة تُحفظ بأطول ضلع لا يتجاوز هذا — يكفي لشاشة كاملة ويبقي الصفحة خفيفة */
const IMAGE_MAX_EDGE = 2400;
const UPLOAD_ID_RE = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

export class UploadError extends Error {
  constructor(
    message: string,
    public status = 400,
    public received?: number,
  ) {
    super(message);
  }
}

const partPath = (id: string) => {
  if (!UPLOAD_ID_RE.test(id)) throw new UploadError('معرّف رفع غير صالح.');
  return path.join(mediaDirectory(), `${id}.part`);
};

const formatGb = (bytes: number) => `${(bytes / 1024 ** 3).toFixed(1)} غيغابايت`;

async function ensureDiskSpace(incoming: number) {
  const fs = await statfs(mediaDirectory());
  const free = fs.bavail * fs.bsize;
  // ×2: النسخ الاحتياطي يحتفظ بنسخة ثانية من كل فيديو على القرص نفسه (scripts/backup.sh)
  if (free - incoming * 2 < DISK_RESERVE_BYTES)
    throw new UploadError(
      `لا مساحة كافية على السيرفر: المتاح ${formatGb(free)} ويجب أن يبقى ${formatGb(DISK_RESERVE_BYTES)} حرّاً. احذف لقطات قديمة من الاستديو.`,
      507,
    );
}

/** يحذف ما تُرك من رفع لم يكتمل (أُغلقت الصفحة في منتصفه). */
async function sweepStaleParts() {
  const dir = mediaDirectory();
  for (const name of await readdir(dir).catch(() => [] as string[])) {
    if (!name.endsWith('.part')) continue;
    const file = path.join(dir, name);
    const info = await stat(file).catch(() => null);
    if (info && Date.now() - info.mtimeMs > STALE_PART_MS) await unlink(file).catch(() => {});
  }
}

export async function startUpload(size: number) {
  if (!Number.isSafeInteger(size) || size <= 0) throw new UploadError('ملف فارغ.');
  await mkdir(mediaDirectory(), { recursive: true });
  await sweepStaleParts();
  await ensureDiskSpace(size);
  const id = randomUUID();
  await writeFile(partPath(id), '', { flag: 'wx', mode: 0o640 });
  return { id, chunkSize: CHUNK_BYTES };
}

/**
 * يلحق دفعة بالملف. `offset` يجب أن يساوي ما وصل فعلاً — دفعة أُعيد إرسالها بعد انقطاع
 * لا تُكتب مرتين؛ يعود الخادم بما عنده (409) ليكمل المتصفح من هناك.
 */
export async function appendChunk(id: string, offset: number, body: ReadableStream<Uint8Array>) {
  const file = partPath(id);
  const info = await stat(file).catch(() => null);
  if (!info) throw new UploadError('انتهت جلسة الرفع — أعد رفع الملف.', 404);
  if (offset !== info.size) throw new UploadError('ترتيب الدفعات غير متطابق.', 409, info.size);
  const chunks: Uint8Array[] = [];
  let length = 0;
  const reader = body.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_CHUNK_BYTES) {
        await reader.cancel();
        throw new UploadError('دفعة أكبر من المسموح.', 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  if (length === 0) throw new UploadError('دفعة فارغة.');
  await ensureDiskSpace(length);
  await appendFile(file, Buffer.concat(chunks));
  return info.size + length;
}

/**
 * ينهي الرفع: النوع يُكشف من بايتات الملف لا مما يدّعيه المتصفح. الصور تُدوَّر حسب
 * اتجاه الكاميرا وتُصغَّر إلى WebP — صورة هاتف بـ12 ميغابايت تصير مئات الكيلوبايتات
 * بلا فرق تراه العين. الفيديو وPDF يُحفظان كما هما.
 */
export async function finishUpload(id: string, allowed: readonly MediaKind[]) {
  const file = partPath(id);
  const dir = mediaDirectory();
  try {
    const handle = await open(file, 'r').catch(() => null);
    if (!handle) throw new UploadError('انتهت جلسة الرفع — أعد رفع الملف.', 404);
    const head = Buffer.alloc(16);
    const { bytesRead } = await handle.read(head, 0, 16, 0).finally(() => handle.close());
    const ext = detectMedia(head.subarray(0, bytesRead));
    const kind = ext ? KIND_OF[ext] : null;
    if (!ext || !kind)
      throw new UploadError(
        'نوع الملف غير مدعوم — صور JPG/PNG/WEBP/AVIF، فيديو MP4/MOV/WEBM، أو PDF.',
      );
    if (!allowed.includes(kind))
      throw new UploadError(
        allowed.includes('FILE')
          ? 'هذا الرفع لملفات PDF فقط.'
          : allowed.includes('VIDEO')
            ? 'هنا تُرفع الصور والفيديو فقط.'
            : 'هذا الرفع للصور فقط.',
      );
    if (kind === 'IMAGE') {
      const filename = `${id}.webp`;
      try {
        await sharp(file)
          .rotate()
          .resize({
            width: IMAGE_MAX_EDGE,
            height: IMAGE_MAX_EDGE,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 82 })
          .toFile(path.join(dir, filename));
      } catch {
        await unlink(path.join(dir, filename)).catch(() => {});
        throw new UploadError('تعذّرت قراءة الصورة — قد تكون تالفة.');
      }
      await chmod(path.join(dir, filename), 0o640).catch(() => {});
      return { filename, url: `/uploads/studio/${filename}`, type: kind };
    }
    const filename = `${id}.${ext}`;
    await rename(file, path.join(dir, filename));
    return { filename, url: `/uploads/studio/${filename}`, type: kind };
  } finally {
    await unlink(file).catch(() => {});
  }
}

/** هل الرابط لملف مرفوع موجود فعلاً؟ يعيد نوعه — لتسجيل لقطة استديو بعد اكتمال رفعها. */
export async function uploadedMediaKind(url: string): Promise<MediaKind | null> {
  const filename = url.replace(/^\/uploads\/studio\//, '');
  if (!isMediaFilename(filename)) return null;
  const info = await stat(path.join(mediaDirectory(), filename)).catch(() => null);
  return info?.isFile() ? KIND_OF[path.extname(filename).slice(1)] : null;
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
