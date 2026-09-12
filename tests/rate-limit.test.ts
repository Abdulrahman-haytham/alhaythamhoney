import { it, expect, vi, afterAll } from 'vitest';
import { PGlite } from '@electric-sql/pglite';

const state = vi.hoisted(() => ({ query: vi.fn(), cleanup: vi.fn() }));
vi.mock('@/lib/db', () => ({
  db: { $queryRaw: state.query, rateLimit: { deleteMany: state.cleanup } },
}));
const { rateLimit } = await import('@/lib/rate-limit');
const pg = new PGlite();
afterAll(async () => {
  await pg.close();
  vi.unstubAllEnvs();
});

it('atomically throttles a shared key, expires windows, and honors Retry-After', async () => {
  await pg.exec(
    'CREATE TABLE rate_limits (key TEXT PRIMARY KEY, count INT NOT NULL, "expiresAt" TIMESTAMP NOT NULL)',
  );
  state.query.mockImplementation(async (parts: TemplateStringsArray, ...values: unknown[]) => {
    const sql = parts.reduce(
      (out, part, i) => out + part + (i < values.length ? `$${i + 1}` : ''),
      '',
    );
    return (await pg.query(sql, values)).rows;
  });
  state.cleanup.mockResolvedValue({ count: 0 });
  vi.stubEnv('TRUST_PROXY', '1');
  const request = new Request('http://localhost', { headers: { 'x-client-ip': '192.0.2.99' } });
  const responses = await Promise.all(
    Array.from({ length: 6 }, () => rateLimit(request, 'test', 3, 60)),
  );
  expect(responses.filter((r) => r === null)).toHaveLength(3);
  const limited = responses.filter((r) => r !== null);
  expect(limited.every((r) => r.status === 429)).toBe(true);
  expect(Number(limited[0].headers.get('Retry-After'))).toBeGreaterThan(0);
  // Use the same clock as the application; the WASM engine has its own clock.
  await pg.query('UPDATE rate_limits SET "expiresAt" = $1', [new Date(Date.now() - 60_000)]);
  expect(await rateLimit(request, 'test', 3, 60)).toBeNull();
}, 30000);
