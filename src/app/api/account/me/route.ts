import { NextResponse } from 'next/server';
import { currentCustomer } from '@/lib/customer-auth';

export const dynamic = 'force-dynamic';

/**
 * جلسة الزبون للمتصفح. قراءة الكوكي انتقلت إلى هنا حتى يتوقّف التخطيط الجذري عن
 * قراءتها: قراءة واحدة للكوكي في التخطيط تجعل **كل** صفحة في الموقع ديناميكية،
 * فلا يمكن تخزين أي صفحة عامة ولا خدمتها من الحافة.
 */
export async function GET() {
  const customer = await currentCustomer();
  return NextResponse.json(
    {
      customer: customer
        ? {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            city: customer.city,
          }
        : null,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
