import { NextResponse } from 'next/server';
import { checkOrigin } from '@/lib/request-security';
import { CUSTOMER_COOKIE } from '@/lib/customer-auth';

export async function POST(request: Request) {
  const denied = checkOrigin(request);
  if (denied) return denied;
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: CUSTOMER_COOKIE, value: '', path: '/', maxAge: 0 });
  return res;
}
