import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { requireAdmin } from '@/lib/auth';
import { readJson } from '@/lib/request-security';
import { generateCodesInput } from '@/lib/validation';
import { generateJarCodes } from '@/lib/draws.server';
import { SITE } from '@/lib/config';

/** توليد دفعة رموز للطباعة على الملصقات. */
export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = generateCodesInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  const batchId = parsed.data.batchId
    ? ((await db.batch.findUnique({ where: { id: parsed.data.batchId }, select: { id: true } }))
        ?.id ?? null)
    : null;
  const count = await generateJarCodes(parsed.data.batch, parsed.data.count, batchId);
  return NextResponse.json({ ok: true, count }, { status: 201 });
}

/** تصدير دفعة كـ CSV (للمطبعة): الرمز، الدفعة، هل استُخدم. */
export async function GET(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'غير مصرّح.' }, { status: 401 });
  const batch = new URL(request.url).searchParams.get('batch')?.slice(0, 60) ?? '';
  const rows = await db.jarCode.findMany({
    where: batch ? { batch } : {},
    orderBy: { createdAt: 'asc' },
    select: { code: true, batch: true, usedAt: true, passport: { select: { code: true } } },
  });
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [
    'code,batch,used,url,passport',
    ...rows.map((r) =>
      [
        r.code,
        escape(r.batch),
        r.usedAt ? 'yes' : 'no',
        `${SITE.url}/j/${r.code}`,
        r.passport?.code ?? '',
      ].join(','),
    ),
  ].join('\r\n');
  return new Response(`﻿${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="jar-codes${batch ? `-${encodeURIComponent(batch)}` : ''}.csv"`,
    },
  });
}
