import { isIP } from 'node:net';
import { NextResponse } from 'next/server';

/** Only trust the header our private reverse proxy overwrites, never arbitrary X-Forwarded-For. */
export function clientAddress(request: Request) {
  const ip = process.env.TRUST_PROXY === '1' ? request.headers.get('x-client-ip') : null;
  return ip && isIP(ip) ? ip : 'unproxied';
}

export function checkOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const expected = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  if (!origin || origin !== new URL(expected).origin) {
    return NextResponse.json({ error: 'مصدر الطلب غير مسموح.' }, { status: 403 });
  }
  return null;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Bound JSON before parsing, including requests with no Content-Length. */
export async function readJson(request: Request, maxBytes = 16 * 1024): Promise<unknown> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}
