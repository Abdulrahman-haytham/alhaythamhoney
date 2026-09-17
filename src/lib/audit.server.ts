import 'server-only';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

type Json = Prisma.InputJsonValue;
type Record_ = object;

const SKIP_KEYS = new Set(['updatedAt', 'createdAt', 'passwordHash']);

/** يقارن حقلين بعمق كافٍ (JSON) — المصفوفات والكائنات تُقارن بمحتواها. */
function same(a: unknown, b: unknown) {
  if (a instanceof Date || b instanceof Date)
    return (a instanceof Date ? a.getTime() : a) === (b instanceof Date ? b.getTime() : b);
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function truncate(v: unknown): unknown {
  if (typeof v === 'string' && v.length > 300) return `${v.slice(0, 300)}… (${v.length} حرفاً)`;
  if (v instanceof Date) return v.toISOString();
  return v ?? null;
}

/** الحقول المتغيّرة فقط: { field: { from, to } } */
export function diffRecords(before: Record_ | null, after: Record_ | null) {
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  const b = (before ?? {}) as Record<string, unknown>;
  const a = (after ?? {}) as Record<string, unknown>;
  const keys = new Set([...Object.keys(b), ...Object.keys(a)]);
  for (const key of keys) {
    if (SKIP_KEYS.has(key)) continue;
    const from = b[key];
    const to = a[key];
    if (!same(from, to)) changes[key] = { from: truncate(from), to: truncate(to) };
  }
  return changes;
}

/**
 * سجلّ التغييرات (Odoo chatter): يُستدعى بعد أي كتابة من اللوحة.
 * لا يُسقط الطلب إن فشل — السجل مساعد لا شرط.
 */
export async function logAudit(params: {
  entity: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'status';
  label?: string | null;
  before?: Record_ | null;
  after?: Record_ | null;
}) {
  try {
    const admin = await requireAdmin();
    const changes =
      params.action === 'update' || params.action === 'status'
        ? diffRecords(params.before ?? null, params.after ?? null)
        : null;
    if (params.action === 'update' && changes && Object.keys(changes).length === 0) return;
    await db.auditLog.create({
      data: {
        entity: params.entity,
        entityId: params.entityId,
        action: params.action,
        label: params.label ?? null,
        changes: (changes ?? undefined) as Json | undefined,
        actor: admin?.name ?? 'admin',
      },
    });
  } catch (error) {
    console.error('[audit] failed', error);
  }
}

export const ENTITY_LABELS: Record<string, string> = {
  product: 'منتج',
  article: 'مقال',
  coupon: 'كوبون',
  settings: 'الإعدادات',
  mixture: 'خلطة',
  draw: 'سحب',
  review: 'تقييم',
  order: 'طلب',
  promotion: 'عرض',
  zone: 'منطقة شحن',
  attribute: 'خاصية',
  batch: 'دفعة',
  campaign: 'حملة',
  lead: 'طلب جملة',
  customer: 'زبون',
  glossary: 'مدخل موسوعة',
  glossaryCategory: 'مرحلة موسوعة',
};

export const ACTION_LABELS: Record<string, string> = {
  create: 'إنشاء',
  update: 'تعديل',
  delete: 'حذف',
  status: 'تغيير حالة',
};
