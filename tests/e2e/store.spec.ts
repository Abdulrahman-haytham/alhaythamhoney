import { test, expect } from '@playwright/test';

test('mobile storefront, wishlist links, cart and WhatsApp checkout', async ({
  page,
  context,
  request,
}) => {
  await context.route('https://wa.me/**', (route) =>
    route.fulfill({ status: 200, body: 'WhatsApp handoff intercepted in test' }),
  );
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/product/e2e-honey');
  await expect(page.getByRole('heading', { name: 'عسل الاختبار', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'أضف إلى المفضلة', exact: true }).click();
  await page.getByRole('button', { name: 'أضف إلى السلة', exact: true }).click();
  await page.goto('/wishlist');
  await expect(page.locator('main a[href="/product/e2e-honey"]').first()).toBeVisible();
  await page.goto('/cart');
  await expect(page.getByText('عسل الاختبار', { exact: true })).toBeVisible();
  const checkout = page.getByRole('button', { name: 'أكمل الطلب عبر واتساب' });
  await expect(checkout).toBeVisible();
  await page.reload();
  await expect(page.getByText('عسل الاختبار', { exact: true })).toBeVisible();
  const references: string[] = [];
  await page.route('**/api/orders', async (route) => {
    references.push(route.request().postDataJSON().reference);
    if (references.length === 1)
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'تعذّر حفظ الطلب الآن.' }),
      });
    else await route.continue();
  });
  await checkout.click();
  await expect(page.getByRole('alert').filter({ hasText: 'تعذّر حفظ الطلب' })).toBeVisible();
  await expect(page.getByText('سُجّل طلبك برقم', { exact: false })).toHaveCount(0);
  await expect(page.getByText('عسل الاختبار', { exact: true })).toBeVisible();
  const savedResponse = page.waitForResponse(
    (r) => r.url().endsWith('/api/orders') && r.status() === 201,
  );
  await checkout.click();
  const saved = await (await savedResponse).json();
  expect(references).toHaveLength(2);
  expect(references[0]).toBe(references[1]);
  await expect(page.getByRole('link', { name: 'فتح واتساب وإرسال الطلب' })).toHaveAttribute(
    'href',
    /https:\/\/wa.me\//,
  );
  const handoff = new URL(
    (await page.getByRole('link', { name: 'فتح واتساب وإرسال الطلب' }).getAttribute('href'))!,
  );
  expect(handoff.searchParams.get('text')).toContain(saved.reference);
  const tracked = await request.get(`/orders/${saved.reference}`);
  expect(tracked.status()).toBe(200);
  expect(await tracked.text()).toContain(saved.reference);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(errors).toEqual([]);
});

test('contact QR, download and minimal mobile layout', async ({ page, request }) => {
  await page.goto('/q/haytham');
  await expect(page.getByRole('link', { name: 'حفظ جهة الاتصال' })).toBeVisible();
  expect(await page.getByRole('navigation', { name: 'التنقل الرئيسي' }).count()).toBe(0);
  const card = await request.get('/q/haytham/vcard');
  expect(card.status()).toBe(200);
  expect(await card.text()).toContain('BEGIN:VCARD');
  const qr = await request.get('/q/haytham/qr');
  expect(qr.headers()['content-type']).toContain('image/svg+xml');
  expect(await qr.text()).toContain('<svg');
});

test('admin login, product update and logout', async ({ page }) => {
  await page.goto('/admin/products');
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.locator('input').nth(0).fill('e2e-admin');
  await page.locator('input[type=password]').fill('e2e-only-password');
  await page.getByRole('button', { name: 'دخول', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/products/);
  await page.locator('summary').filter({ hasText: 'عسل الاختبار' }).click();
  const editor = page
    .locator('details')
    .filter({ has: page.locator('summary').filter({ hasText: 'عسل الاختبار' }) })
    .first();
  await editor.getByLabel('السعر بالليرة السورية').fill('2000');
  await editor.getByRole('button', { name: 'حفظ المنتج' }).click();
  await expect(editor.getByRole('status')).toHaveText('تم الحفظ.');
  await page.getByRole('button', { name: 'تسجيل الخروج' }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
});

test('offline fallback is precached without caching private pages', async ({ page, context }) => {
  await page.goto('/q/haytham');
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.reload();
  await context.setOffline(true);
  await page.goto('/shop');
  await expect(page.getByRole('heading', { name: 'أنت غير متصل بالإنترنت' })).toBeVisible();
  await context.setOffline(false);
});
