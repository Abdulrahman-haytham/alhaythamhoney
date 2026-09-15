import 'server-only';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';

export type CommerceTx = Prisma.TransactionClient;

export class CommerceError extends Error {
  constructor(
    message: string,
    public readonly status = 409,
  ) {
    super(message);
  }
}

/**
 * Serialize short commercial mutations across all app processes. Quotes must be read
 * after acquiring this transaction lock so balances and monthly budgets are current.
 * No network calls or email delivery belong inside this transaction.
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
