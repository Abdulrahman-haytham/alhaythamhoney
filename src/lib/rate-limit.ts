import 'server-only';
import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clientAddress } from '@/lib/request-security';

/** Atomic fixed window in PostgreSQL, shared across workers and preserved over restarts. */
export async function rateLimit(
  request: Request,
  scope: string,
  limit: number,
  seconds: number,
  identity?: string,
) {
  const now = new Date();
  const key = createHash('sha256')
    .update(`${scope}:${identity ?? clientAddress(request)}`)
    .digest('hex');
  const expiresAt = new Date(now.getTime() + seconds * 1000);
  const [row] = await db.$queryRaw<{ count: number; expiresAt: Date }[]>`
    INSERT INTO rate_limits (key, count, "expiresAt") VALUES (${key}, 1, ${expiresAt})
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits."expiresAt" <= ${now} THEN 1 ELSE rate_limits.count + 1 END,
      "expiresAt" = CASE WHEN rate_limits."expiresAt" <= ${now} THEN ${expiresAt} ELSE rate_limits."expiresAt" END
    RETURNING count, "expiresAt"`;
  if (Math.random() < 0.01)
    await db.rateLimit.deleteMany({ where: { expiresAt: { lt: now } } }).catch(() => {});
  if (row.count <= limit) return null;
  return NextResponse.json(
    { error: 'محاولات كثيرة. انتظر قليلاً وحاول مجدداً.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(
          Math.max(1, Math.ceil((row.expiresAt.getTime() - now.getTime()) / 1000)),
        ),
      },
    },
  );
}
