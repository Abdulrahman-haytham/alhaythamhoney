// تحديث لمرّة واحدة لمحتوى زُرع قديماً: الوصف وتفاصيل المنتج.
// آمن ويُعاد تشغيله بلا ضرر: لا يكتب إلا إذا كانت القيمة الحالية ما زالت هي القيمة
// المزروعة القديمة نفسها — أي تعديل من اللوحة يُترك كما هو.
import { PrismaClient } from '@prisma/client';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const db = new PrismaClient();
const map = JSON.parse(
  await readFile(path.join(process.cwd(), 'scripts', 'seed-content.json'), 'utf8'),
);

let updated = 0;
let skipped = 0;
for (const item of map.descriptions) {
  const current = await db.product.findUnique({
    where: { slug: item.slug },
    select: { id: true, desc: true, detailedInfo: true },
  });
  if (!current) continue;
  const data = {};
  if (current.desc === item.old) data.desc = item.new;
  // التفاصيل تُملأ فقط إن كانت فارغة تماماً (العكبر وغذاء الملكات)
  if (item.detailedInfo && !current.detailedInfo) data.detailedInfo = item.detailedInfo;
  if (Object.keys(data).length === 0) {
    skipped++;
    continue;
  }
  await db.product.update({ where: { id: current.id }, data });
  updated++;
}
console.log(
  `حُدِّث ${updated} منتجاً، وتُرك ${skipped} كما هو (معدَّل من اللوحة أو محدَّث سابقاً).`,
);

// نصوص المقالات: تُحدَّث من ملفات content/articles فقط للمقالات التي لم تُعدَّل من اللوحة.
// كل حفظ من المحرّر ينشئ مراجعة، فوجود مراجعة واحدة يعني أن للأدمن نسخته — فلا نلمسها.
let articlesUpdated = 0;
let articlesKept = 0;
for (const slug of map.articles ?? []) {
  const article = await db.article.findUnique({
    where: { slug },
    select: { id: true, body: true, _count: { select: { revisions: true } } },
  });
  if (!article) continue;
  if (article._count.revisions > 0) {
    articlesKept++;
    continue;
  }
  const body = (
    await readFile(path.join(process.cwd(), 'content', 'articles', `${slug}.md`), 'utf8')
  ).trim();
  if (body === article.body) continue;
  await db.article.update({ where: { id: article.id }, data: { body } });
  articlesUpdated++;
}
console.log(
  `حُدِّث ${articlesUpdated} مقالاً، وتُرك ${articlesKept} لأن له نسخة معدَّلة من اللوحة.`,
);
await db.$disconnect();
