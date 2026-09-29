import { NextResponse } from 'next/server';
import { getInvoiceOrder } from '@/lib/invoice.server';
import { getInvoicePdf } from '@/lib/invoicePdf.server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** فاتورة الطلب PDF — الرابط الذي يصل في رسالة واتساب ويظهر في صفحة التتبّع واللوحة. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const order = await getInvoiceOrder(reference);
  if (!order) return NextResponse.json({ error: 'الطلب غير موجود.' }, { status: 404 });
  try {
    const pdf = await getInvoicePdf(order.reference, order.updatedAt);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="alhaytham-${order.reference}.pdf"`,
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (error) {
    console.error('[invoice] PDF failed', error);
    // المتصفح غير متاح: الصفحة نفسها قابلة للطباعة، فلا يخسر الزبون الفاتورة
    return NextResponse.redirect(new URL(`/orders/${order.reference}/invoice`, _request.url));
  }
}
