import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { isMediaFilename, mediaDirectory, MEDIA_TYPES, parseRange } from '@/lib/uploads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!isMediaFilename(filename)) return new Response(null, { status: 404 });
  const file = path.join(mediaDirectory(), filename);
  let size: number;
  try {
    size = (await stat(file)).size;
  } catch {
    return new Response(null, { status: 404 });
  }
  const headers = new Headers({
    'Content-Type': MEDIA_TYPES[path.extname(filename).slice(1)],
    'X-Content-Type-Options': 'nosniff',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=86400',
    'Content-Security-Policy': "default-src 'none'; sandbox",
  });
  const rangeHeader = request.headers.get('range');
  const range = rangeHeader ? parseRange(rangeHeader, size) : { start: 0, end: size - 1 };
  if (!range)
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  headers.set('Content-Length', String(range.end - range.start + 1));
  if (rangeHeader) headers.set('Content-Range', `bytes ${range.start}-${range.end}/${size}`);
  if (request.method === 'HEAD')
    return new Response(null, { status: rangeHeader ? 206 : 200, headers });
  const stream = Readable.toWeb(createReadStream(file, range)) as ReadableStream<Uint8Array>;
  return new Response(stream, { status: rangeHeader ? 206 : 200, headers });
}

export const HEAD = GET;
