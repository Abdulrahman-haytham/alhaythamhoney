import 'server-only';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { readSessionToken } from '@/lib/session';

export const ADMIN_COOKIE = 'admin_session';

/** يحقّق من كوكي الجلسة ويعيد سجل الأدمن، أو null إن كانت غائبة/غير صالحة/منتهية. */
export async function requireAdmin() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const id = readSessionToken(token);
  return id ? db.admin.findUnique({ where: { id } }) : null;
}
