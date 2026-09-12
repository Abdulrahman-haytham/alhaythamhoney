import 'server-only';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { checkOrigin } from '@/lib/request-security';

export async function guardAdmin(request: Request) {
  const rejected = checkOrigin(request);
  if (rejected) return rejected;
  if (!(await requireAdmin())) return NextResponse.json({ error: 'غير مصرّح.' }, { status: 401 });
  return null;
}
