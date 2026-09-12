import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const ADMIN_COOKIE = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const SECRET = process.env.ADMIN_SESSION_SECRET || process.env.DATABASE_URL || "dev-secret";

function sign(payload: string) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === check.length && crypto.timingSafeEqual(expected, check);
}

export function createSessionToken(adminId: string) {
  const payload = `${adminId}.${Date.now() + SESSION_TTL_MS}`;
  return `${payload}.${sign(payload)}`;
}

/** يحقّق من كوكي الجلسة ويعيد سجل الأدمن، أو null إن كانت غائبة/غير صالحة/منتهية. */
export async function requireAdmin() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const [id, expiresAt, signature] = token.split(".");
  if (!id || !expiresAt || !signature) return null;
  if (sign(`${id}.${expiresAt}`) !== signature) return null;
  if (Date.now() > Number(expiresAt)) return null;

  return db.admin.findUnique({ where: { id } });
}
