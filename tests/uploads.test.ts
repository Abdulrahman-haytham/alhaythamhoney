import { afterAll, describe, it, expect } from 'vitest';
import { mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const root = mkdtempSync(path.join(tmpdir(), 'haytham-uploads-'));
process.env.UPLOAD_DIR = root;
// القرص في بيئة الاختبار قد يكون صغيراً — الهامش يُختبر صراحةً في آخر الملف
process.env.UPLOAD_DISK_RESERVE_MB = '1';
const {
  appendChunk,
  detectMedia,
  finishUpload,
  isMediaFilename,
  mediaDirectory,
  parseRange,
  startUpload,
  uploadedMediaKind,
  UploadError,
} = await import('@/lib/uploads');

afterAll(() => rmSync(root, { recursive: true, force: true }));

const stream = (bytes: Uint8Array) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });

/** يرفع البايتات على دفعات بحجم `chunk` كما يفعل المتصفح */
async function upload(bytes: Buffer, chunk: number) {
  const { id } = await startUpload(bytes.length);
  for (let offset = 0; offset < bytes.length; offset += chunk)
    await appendChunk(id, offset, stream(bytes.subarray(offset, offset + chunk)));
  return id;
}

describe('VPS media safety', () => {
  it('rejects path traversal and scripts', () => {
    expect(isMediaFilename('00000000-0000-4000-8000-000000000001.webp')).toBe(true);
    for (const name of ['../secret', '../../app/.env', 'test.svg', 'x.html'])
      expect(isMediaFilename(name)).toBe(false);
    expect(detectMedia(Buffer.from('<html><script>alert(1)</script></html>'))).toBeNull();
    expect(detectMedia(Buffer.from('RIFF1234WEBPpayload'))).toBe('webp');
    // PDF لتقارير المخبر — يُكتشف من الترويسة لا من الامتداد
    expect(detectMedia(Buffer.from('%PDF-1.7 some content here'))).toBe('pdf');
    expect(isMediaFilename('00000000-0000-4000-8000-000000000001.pdf')).toBe(true);
  });
  it('supports bounded, open-ended and suffix video ranges', () => {
    expect(parseRange('bytes=0-49', 100)).toEqual({ start: 0, end: 49 });
    expect(parseRange('bytes=50-', 100)).toEqual({ start: 50, end: 99 });
    expect(parseRange('bytes=-10', 100)).toEqual({ start: 90, end: 99 });
    for (const invalid of ['bytes=100-', 'bytes=9-2', 'bytes=-0', 'bytes=0-2,4-6', 'nonsense'])
      expect(parseRange(invalid, 100)).toBeNull();
  });
});

describe('chunked uploads without a size cap', () => {
  it('reassembles a video sent in many chunks, byte for byte', async () => {
    // ترويسة MP4 ثم حشو، على دفعات أصغر من الملف بكثير
    const video = Buffer.concat([
      Buffer.from([0, 0, 0, 24]),
      Buffer.from('ftypisom'),
      Buffer.alloc(300_000, 7),
    ]);
    const id = await upload(video, 64_000);
    const media = await finishUpload(id, ['IMAGE', 'VIDEO']);
    expect(media).toMatchObject({ type: 'VIDEO', url: `/uploads/studio/${id}.mp4` });
    expect(statSync(path.join(mediaDirectory(), media.filename)).size).toBe(video.length);
    expect(await uploadedMediaKind(media.url)).toBe('VIDEO');
  });

  it('shrinks a large photo to a web-sized WebP and honours camera rotation', async () => {
    const photo = await sharp({
      create: { width: 4000, height: 3000, channels: 3, background: '#b45309' },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const media = await finishUpload(await upload(photo, 20_000), ['IMAGE']);
    expect(media.filename).toMatch(/\.webp$/);
    const saved = await sharp(path.join(mediaDirectory(), media.filename)).metadata();
    // الاتجاه 6 = الصورة مُدارة ربع دورة: تُحفظ واقفة، وأطول ضلع 2400
    expect([saved.width, saved.height, saved.format]).toEqual([1800, 2400, 'webp']);
  });

  it('resyncs a resent chunk instead of writing it twice', async () => {
    const { id } = await startUpload(10);
    await appendChunk(id, 0, stream(Buffer.from('%PDF-')));
    const again = await appendChunk(id, 0, stream(Buffer.from('%PDF-'))).catch((e) => e);
    expect(again).toBeInstanceOf(UploadError);
    expect(again).toMatchObject({ status: 409, received: 5 });
    await appendChunk(id, 5, stream(Buffer.from('1.7 report body')));
    expect((await finishUpload(id, ['FILE'])).type).toBe('FILE');
  });

  it('refuses scripts, wrong kinds and made-up upload ids, leaving nothing behind', async () => {
    const html = await upload(Buffer.from('<html><script>alert(1)</script></html>'), 1000);
    await expect(finishUpload(html, ['IMAGE', 'VIDEO'])).rejects.toThrow(/غير مدعوم/);
    const pdf = await upload(Buffer.from('%PDF-1.7 some content here'), 1000);
    await expect(finishUpload(pdf, ['IMAGE'])).rejects.toThrow(/للصور فقط/);
    const fake = await upload(Buffer.concat([Buffer.from([255, 216, 255]), Buffer.alloc(40)]), 99);
    await expect(finishUpload(fake, ['IMAGE'])).rejects.toThrow(/تالفة/);
    await expect(appendChunk('../../etc/passwd', 0, stream(Buffer.from('x')))).rejects.toThrow();
    await expect(finishUpload('00000000-0000-4000-8000-000000000001', ['IMAGE'])).rejects.toThrow();
    expect(await uploadedMediaKind('/uploads/studio/../../secret.webp')).toBeNull();
    expect(readdirSync(mediaDirectory()).filter((f) => f.endsWith('.part'))).toEqual([]);
  });

  it('keeps a free-disk margin instead of filling the server', async () => {
    await expect(startUpload(Number.MAX_SAFE_INTEGER)).rejects.toMatchObject({ status: 507 });
  });
});
