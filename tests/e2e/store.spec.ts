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
  // الرسالة والصفحة تعرضان الرقم القصير؛ الرابط يحمل المرجع الطويل
  expect(saved.number).toBeGreaterThanOrEqual(10000);
  expect(handoff.searchParams.get('text')).toContain(`الطلب رقم ${saved.number}`);
  expect(handoff.searchParams.get('text')).toContain(`/orders/${saved.reference}`);
  const tracked = await request.get(`/orders/${saved.reference}`);
  expect(tracked.status()).toBe(200);
  expect(await tracked.text()).toContain(String(saved.number));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(errors).toEqual([]);
});

test('contact QR, download and minimal mobile layout', async ({ page, request }) => {
  await page.goto('/q/haytham');
  await expect(page.getByRole('link', { name: 'اطلب مرة أخرى' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'حفظ الرقم' })).toBeVisible();
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

test('admin uploads product photos and a large video, and adds a mixture', async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  const { default: sharp } = await import('sharp');
  const { writeFile } = await import('node:fs/promises');
  const photo = (background: string) =>
    sharp({ create: { width: 1600, height: 1200, channels: 3, background } })
      .jpeg()
      .toBuffer();

  await page.goto('/admin/products');
  await page.locator('input').nth(0).fill('e2e-admin');
  await page.locator('input[type=password]').fill('e2e-only-password');
  await page.getByRole('button', { name: 'دخول', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/products/);

  // صور المنتج: تُرفع من المحرّر نفسه (بلا روابط)، وأكثر من صورة دفعة واحدة
  await page.locator('summary').filter({ hasText: 'عسل الاختبار' }).click();
  const editor = page
    .locator('details')
    .filter({ has: page.locator('summary').filter({ hasText: 'عسل الاختبار' }) })
    .first();
  await editor.locator('input[type=file]').setInputFiles([
    { name: 'front.jpg', mimeType: 'image/jpeg', buffer: await photo('#b45309') },
    { name: 'back.jpg', mimeType: 'image/jpeg', buffer: await photo('#3f6212') },
  ]);
  await expect(editor.locator('img[src^="/uploads/studio/"]')).toHaveCount(2);
  await editor.getByRole('button', { name: 'حفظ المنتج' }).click();
  await expect(editor.getByRole('status')).toHaveText('تم الحفظ.');

  await page.goto('/product/e2e-honey');
  await expect(page.getByRole('button', { name: /^عرض الصورة/ })).toHaveCount(3);
  await page.getByRole('button', { name: 'عرض الصورة 2' }).click();
  // الصورة المرفوعة تُخدَم فعلاً عبر محسّن الصور، لا مجرد وسم في الصفحة
  await expect
    .poll(() =>
      page
        .getByAltText('عسل الاختبار — صورة 2')
        .evaluate((img) => (img as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);

  // خلطة جديدة من اللوحة تظهر للزبون
  await page.goto('/admin/mixtures');
  await page.getByRole('button', { name: 'خلطة جديدة' }).click();
  await page.getByLabel('اسم الخلطة').first().fill('الاختبار الآلي');
  await page
    .getByLabel(/^الرابط/)
    .first()
    .fill('e2e-mix');
  await page.getByLabel('الوصف كما يراه الزبون').first().fill('خلطة تُنشأ في الاختبار الآلي فقط.');
  await page.getByLabel('اسم المكوّن').first().fill('حبة البركة');
  await page.getByLabel('منشورة').first().check();
  await page.getByRole('button', { name: 'إنشاء الخلطة' }).click();
  await expect(page.getByRole('heading', { name: 'الاختبار الآلي' })).toBeVisible();
  await page.goto('/custom-mixtures/e2e-mix');
  await expect(page.getByRole('heading', { name: 'خلطة الاختبار الآلي' })).toBeVisible();
  await expect(page.getByText('حبة البركة').first()).toBeVisible();

  // الاستديو: فيديو أكبر من الحدّ القديم (60MB) يُرفع كاملاً على دفعات
  const size = 70 * 1024 * 1024;
  const video = Buffer.alloc(size);
  Buffer.from([0, 0, 0, 24]).copy(video, 0);
  video.write('ftypisom', 4, 'ascii');
  const file = testInfo.outputPath('big.mp4');
  await writeFile(file, video);
  await page.goto('/admin/studio');
  await page.locator('#studio-upload').setInputFiles(file);
  const player = page.locator('video[src^="/uploads/studio/"]').first();
  await expect(player).toBeVisible({ timeout: 120_000 });
  const served = await page.request.head((await player.getAttribute('src'))!);
  expect(Number(served.headers()['content-length'])).toBe(size);
});
