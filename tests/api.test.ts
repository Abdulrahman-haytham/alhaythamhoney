import { it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  admin: vi.fn(),
  limit: vi.fn(),
  find: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  cookie: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({ requireAdmin: mocks.admin, ADMIN_COOKIE: 'admin_session' }));
vi.mock('@/lib/rate-limit', () => ({ rateLimit: mocks.limit }));
vi.mock('next/headers', () => ({ cookies: async () => ({ set: mocks.cookie }) }));
vi.mock('@/lib/db', () => ({
  db: {
    product: {
      findFirst: mocks.find,
      findUnique: mocks.find,
      create: mocks.create,
      update: mocks.update,
    },
    review: { create: mocks.create, updateMany: mocks.update },
    admin: { findUnique: mocks.find },
  },
}));
const { POST: submitReview } = await import('@/app/api/reviews/route');
const { POST: login } = await import('@/app/api/admin/login/route');
const { PATCH: editReview } = await import('@/app/api/admin/reviews/[id]/route');
const { POST: createProduct } = await import('@/app/api/admin/products/route');
const { hashPassword } = await import('@/lib/password');
beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://honey.example');
  vi.stubEnv('ADMIN_SESSION_SECRET', 'a'.repeat(64));
  mocks.limit.mockResolvedValue(null);
  mocks.admin.mockResolvedValue(null);
});
function request(body: unknown, origin = 'https://honey.example') {
  return new Request('https://honey.example/api', {
    method: 'POST',
    headers: { origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

it('requires a logged-in admin for mutations', async () => {
  expect((await createProduct(request({}))).status).toBe(401);
  expect(
    (await editReview(request({ status: 'APPROVED' }), { params: Promise.resolve({ id: 'r' }) }))
      .status,
  ).toBe(401);
  expect(mocks.create).not.toHaveBeenCalled();
});
it('blocks cross-site admin requests', async () => {
  mocks.admin.mockResolvedValue({ id: 'admin' });
  expect((await createProduct(request({}, 'https://evil.example'))).status).toBe(403);
});
it('publishes reviews only through an authenticated admin', async () => {
  mocks.admin.mockResolvedValue({ id: 'admin' });
  mocks.update.mockResolvedValue({ count: 1 });
  expect(
    (await editReview(request({ status: 'APPROVED' }), { params: Promise.resolve({ id: 'r' }) }))
      .status,
  ).toBe(200);
  expect(mocks.update).toHaveBeenCalledWith({ where: { id: 'r' }, data: { status: 'APPROVED' } });
});
it('stores new reviews as pending without a verified order', async () => {
  mocks.find.mockResolvedValue({ id: 'product' });
  mocks.create.mockResolvedValue({ id: 'review' });
  const response = await submitReview(
    request({
      productSlug: 'honey',
      authorName: 'عبدالرحمن',
      body: 'تجربة جيدة مع المنتج',
      rating: 5,
    }),
  );
  expect(response.status).toBe(201);
  expect(mocks.create).toHaveBeenCalledWith({
    data: expect.objectContaining({ status: 'PENDING', productId: 'product', orderRef: null }),
  });
});
it('rejects malformed and throttled reviews without a database write', async () => {
  expect((await submitReview(request(null))).status).toBe(400);
  mocks.limit.mockResolvedValue(Response.json({}, { status: 429 }));
  expect((await submitReview(request({}))).status).toBe(429);
  expect(mocks.create).not.toHaveBeenCalled();
});
it('logs in with a signed HttpOnly cookie and rejects wrong credentials', async () => {
  mocks.find.mockResolvedValue({ id: 'admin', passwordHash: hashPassword('correct-password') });
  expect((await login(request({ username: 'admin', password: 'wrong' }))).status).toBe(401);
  expect(mocks.cookie).not.toHaveBeenCalled();
  expect((await login(request({ username: 'admin', password: 'correct-password' }))).status).toBe(
    200,
  );
  expect(mocks.cookie).toHaveBeenCalledWith(
    'admin_session',
    expect.any(String),
    expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
  );
});
