import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { ADMIN_COOKIE } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/password';
import { createSessionToken } from '@/lib/session';
import { checkOrigin, isRecord, readJson } from '@/lib/request-security';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const DUMMY_HASH = hashPassword('not-a-real-admin-password');

export async function POST(request: Request) {
  const denied = checkOrigin(request) || (await rateLimit(request, 'login-ip', 20, 900));
  if (denied) return denied;
  const body = await readJson(request, 2048);
  if (!isRecord(body)) return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!username || username.length > 80 || !password || password.length > 256) {
    return NextResponse.json({ error: 'أدخل اسم المستخدم وكلمة المرور.' }, { status: 400 });
  }

  const throttled = await rateLimit(request, 'login-account', 10, 900, username);
  if (throttled) return throttled;
  const admin = await db.admin.findUnique({ where: { username } });
  const valid = verifyPassword(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !valid) {
    return NextResponse.json({ error: 'بيانات الدخول غير صحيحة.' }, { status: 401 });
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, createSessionToken(admin.id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}
