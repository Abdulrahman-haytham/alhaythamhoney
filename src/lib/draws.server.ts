import 'server-only';
import { randomInt } from 'node:crypto';
import { db } from '@/lib/db';
import { JAR_CODE_ALPHABET } from '@/lib/validation';

/** رمز مرطبان بصيغة HY-XXXX-XXXX من أبجدية بلا أحرف ملتبسة (0/O، 1/I). */
export function randomJarCode() {
  const pick = () => JAR_CODE_ALPHABET[randomInt(0, JAR_CODE_ALPHABET.length)];
  const part = () => pick() + pick() + pick() + pick();
  return `HY-${part()}-${part()}`;
}

/** يولّد دفعة رموز فريدة (يعيد المحاولة عند التصادم النادر). */
export async function generateJarCodes(batch: string, count: number): Promise<number> {
  let created = 0;
  while (created < count) {
    const codes = new Set<string>();
    while (codes.size < count - created) codes.add(randomJarCode());
    const result = await db.jarCode.createMany({
      data: [...codes].map((code) => ({ code, batch })),
      skipDuplicates: true,
    });
    created += result.count;
  }
  return created;
}

/** السحب المفتوح حالياً (ضمن تاريخيه) إن وُجد. */
export async function getOpenDraw() {
  const now = new Date();
  return db.draw.findFirst({
    where: { status: 'OPEN', startsAt: { lte: now }, endsAt: { gte: now } },
    orderBy: { endsAt: 'asc' },
    include: { _count: { select: { entries: true } } },
  });
}

/** الفائزون المعلنون — الاسم مُقنَّع للخصوصية (أحمد م.). */
export async function getPastWinners(limit = 6) {
  const rows = await db.draw.findMany({
    where: { status: 'DRAWN', winnerEntry: { isNot: null } },
    orderBy: { endsAt: 'desc' },
    take: limit,
    include: { winnerEntry: { include: { customer: { select: { name: true, city: true } } } } },
  });
  return rows.map((d) => ({
    id: d.id,
    title: d.title,
    prize: d.prize,
    endsAt: d.endsAt,
    winner: d.winnerEntry ? maskName(d.winnerEntry.customer.name) : null,
    city: d.winnerEntry?.customer.city ?? null,
  }));
}

export function maskName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export type EnterResult = { ok: true; entries: number } | { ok: false; reason: string };

/** مشاركة زبون برمز مرطبان في السحب المفتوح — كل رمز مرة واحدة إلى الأبد. */
export async function enterDraw(customerId: string, code: string): Promise<EnterResult> {
  const draw = await getOpenDraw();
  if (!draw) return { ok: false, reason: 'لا يوجد سحب مفتوح حالياً.' };
  const jar = await db.jarCode.findUnique({ where: { code }, include: { entry: true } });
  if (!jar) return { ok: false, reason: 'رمز المرطبان غير موجود — تأكد من الملصق.' };
  if (jar.entry) return { ok: false, reason: 'هذا الرمز استُخدم من قبل.' };
  if (draw.maxEntries > 0) {
    const mine = await db.drawEntry.count({ where: { drawId: draw.id, customerId } });
    if (mine >= draw.maxEntries)
      return { ok: false, reason: `الحد الأقصى ${draw.maxEntries} مشاركات لهذا السحب.` };
  }
  try {
    await db.$transaction([
      db.drawEntry.create({ data: { drawId: draw.id, customerId, jarCodeId: jar.id } }),
      db.jarCode.update({
        where: { id: jar.id },
        data: { usedAt: new Date(), usedById: customerId },
      }),
    ]);
  } catch {
    // سباق نادر: الرمز استُخدم بين القراءة والكتابة (قيد unique على jarCodeId)
    return { ok: false, reason: 'هذا الرمز استُخدم من قبل.' };
  }
  const entries = await db.drawEntry.count({ where: { drawId: draw.id, customerId } });
  return { ok: true, entries };
}

/** اختيار الفائز عشوائياً بين المشاركات (كل مرطبان = فرصة). */
export async function pickWinner(drawId: string) {
  const entries = await db.drawEntry.findMany({ where: { drawId }, select: { id: true } });
  if (entries.length === 0) return null;
  const winner = entries[randomInt(0, entries.length)];
  await db.draw.update({
    where: { id: drawId },
    data: { status: 'DRAWN', winnerEntryId: winner.id },
  });
  return winner.id;
}
