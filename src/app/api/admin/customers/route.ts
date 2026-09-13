import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

/** تصدير الزبائن CSV — للرسائل الجماعية (واتساب/بريد). يحترم خيار «أرغب بالعروض». */
export async function GET(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'غير مصرّح.' }, { status: 401 });
  const onlyOptIn = new URL(request.url).searchParams.get('optin') === '1';
  const rows = await db.customer.findMany({
    where: onlyOptIn ? { marketingOptIn: true } : {},
    orderBy: { createdAt: 'desc' },
    select: {
      name: true,
      phone: true,
      email: true,
      city: true,
      marketingOptIn: true,
      createdAt: true,
    },
  });
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [
    'name,phone,email,city,marketing_opt_in,joined',
    ...rows.map((r) =>
      [
        escape(r.name),
        r.phone,
        r.email,
        escape(r.city ?? ''),
        r.marketingOptIn ? 'yes' : 'no',
        r.createdAt.toISOString().slice(0, 10),
      ].join(','),
    ),
  ].join('\r\n');
  return new Response(`﻿${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="customers.csv"',
    },
  });
}
