import 'server-only';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';

export type CommerceTx = Prisma.TransactionClient;

/** خطأ تجاري معروف (مرجع مكرر، رصيد لا يكفي، انتقال حالة غير مسموح) — يُعاد للزبون برسالته. */
export class CommerceError extends Error {
  constructor(
    message: string,
    public readonly status = 409,
  ) {
    super(message);
  }
}

/**
 * يسلسل الكتابات التجارية القصيرة بين كل عمليات التطبيق (قفل استشاري في PostgreSQL)،
 * فلا يُنشئ طلبان متزامنان خصماً مزدوجاً على النقاط أو ميزانية العروض.
 * عرض السعر يُقرأ بعد أخذ القفل ليكون الرصيد والميزانية محدَّثين.
 * لا مكان هنا لنداء شبكة أو إرسال بريد — يبقيان خارج المعاملة.
 */
export function commerceTransaction<T>(work: (tx: CommerceTx) => Promise<T>) {
  return db.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(724910)`;
      return work(tx);
    },
    { maxWait: 10000, timeout: 20000 },
  );
}
