import 'server-only';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * يطبع صفحة الفاتورة (`/orders/[ref]/invoice`) إلى PDF بمتصفح Chromium المثبّت في الحاوية:
 * العربية بحروفها المتصلة واتجاهها والصور تخرج كما في الموقع، وهو ما لا تحسنه مكتبات PDF الخفيفة.
 *
 * كل فاتورة تُولَّد مرة ثم تُحفظ باسم يتضمّن لحظة آخر تعديل للطلب، فأي تعديل في اللوحة
 * يُنتج ملفاً جديداً، والطلبات المتكررة لنفس الرابط تُخدم من القرص بلا متصفح.
 * التوليد متسلسل (واحد في كل مرة) كي لا تُفتح عدة نسخ من Chromium على خادم صغير.
 */
const CACHE_DIR = path.resolve(
  process.env.UPLOAD_DIR || path.join(process.cwd(), 'data', 'uploads'),
  'invoices',
);
const CHROMIUM = process.env.CHROMIUM_PATH || '/usr/bin/chromium';

let queue: Promise<unknown> = Promise.resolve();
function serial<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

export function invoiceCacheKey(reference: string, updatedAt: Date) {
  const v = createHash('sha256').update(updatedAt.toISOString()).digest('hex').slice(0, 12);
  return `${reference}-${v}.pdf`;
}

export async function getInvoicePdf(reference: string, updatedAt: Date): Promise<Buffer> {
  const file = path.join(CACHE_DIR, invoiceCacheKey(reference, updatedAt));
  try {
    return await readFile(file);
  } catch {
    // غير مخزّنة بعد
  }
  return serial(async () => {
    try {
      return await readFile(file); // ولّدها طلب سابق كان في الطابور
    } catch {}
    const pdf = await renderInvoice(reference);
    await mkdir(CACHE_DIR, { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    await writeFile(tmp, pdf);
    await rename(tmp, file);
    return pdf;
  });
}

async function renderInvoice(reference: string): Promise<Buffer> {
  const { launch } = await import('puppeteer-core');
  const port = process.env.PORT || '3005';
  const browser = await launch({
    executablePath: CHROMIUM,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  });
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${port}/orders/${encodeURIComponent(reference)}/invoice`, {
      waitUntil: 'networkidle0',
      timeout: 30_000,
    });
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
