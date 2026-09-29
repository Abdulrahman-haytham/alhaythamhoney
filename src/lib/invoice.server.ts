import 'server-only';
import path from 'node:path';
import { mediaDirectory } from '@/lib/uploads';
import { db } from '@/lib/db';
import { normalizeOrderReference } from '@/lib/orders';
import type { QuoteAdjustment } from '@/lib/pricing';

export interface InvoiceBreakdown {
  adjustments?: QuoteAdjustment[];
  freeShipping?: boolean;
  shippingLabel?: string | null;
}

/**
 * الطلب كما تعرضه الفاتورة — بلا اسم ولا هاتف، كصفحة التتبّع: المرجع وحده يفتحها،
 * وهو عشوائي ولا يظهر إلا في رسالة الزبون نفسه.
 */
export async function getInvoiceOrder(rawReference: string) {
  const reference = normalizeOrderReference(rawReference);
  if (!reference) return null;
  const order = await db.order.findUnique({
    where: { reference },
    select: {
      reference: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      subtotal: true,
      discount: true,
      shipping: true,
      total: true,
      breakdown: true,
      items: {
        select: {
          id: true,
          name: true,
          price: true,
          quantity: true,
          weight: true,
          image: true,
          recipe: true,
        },
      },
    },
  });
  if (!order) return null;
  return { ...order, breakdown: (order.breakdown ?? {}) as InvoiceBreakdown };
}

/**
 * صورة مصغّرة مضمَّنة (data URI) لملف PDF: مُحسِّن صور Next يرفض العناوين المحلية،
 * وChromium يفتح الفاتورة عبر 127.0.0.1، والصور بحجمها الأصلي تجعل الملف ثقيلاً على الجوال.
 * المسارات المقبولة هي ما يُحفظ فعلاً مع البند: صور الموقع أو ملفات الاستديو المرفوعة.
 */
export async function invoiceThumb(src: string | null, size = 160): Promise<string | null> {
  if (!src) return null;
  let file: string | null = null;
  if (/^\/images\/[a-zA-Z0-9/_-]+\.(webp|png|jpe?g|avif)$/.test(src))
    file = path.join(process.cwd(), 'public', src);
  else {
    const m = src.match(/^\/uploads\/studio\/([a-f0-9-]+\.(?:webp|png|jpe?g|avif))$/);
    if (m) file = path.join(mediaDirectory(), m[1]);
  }
  if (!file) return null;
  try {
    const { default: sharp } = await import('sharp');
    const jpg = await sharp(file)
      .resize(size, size, { fit: 'cover' })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 72 })
      .toBuffer();
    return `data:image/jpeg;base64,${jpg.toString('base64')}`;
  } catch {
    return null;
  }
}
