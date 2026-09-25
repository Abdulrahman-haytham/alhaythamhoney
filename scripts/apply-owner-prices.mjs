// الأسعار والأوزان كما أكّدها المالك، وتصفير ما لم يُسعَّر بعد.
// يُشغَّل بعد convert-to-new-lira.mjs، وآمن ويُعاد تشغيله: يضبط حالة نهائية.
//
// صفر في pricePerGram يعني «لم يحدّده المالك» لا «مجاني». هذه المكوّنات
// تظهر في خلطات مفتوحة، فتنقص من سعرها حتى تُملأ من لوحة التحكم.
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// عبوات أكّدها المالك: غذاء الملكات ١٠ غرام، العكبر ٥٠ غرام
const PRODUCTS = [
  { name: 'غذاء ملكات النحل', price: 1000, weight: '10 غرام' },
  { name: 'العكبر (Propolis)', price: 500, weight: '50 غرام' },
];

// سعر الغرام المؤكَّد من المالك
const PRICED = new Map([
  ['غذاء ملكات النحل', 100],
  ['العكبر (Propolis)', 10],
  ['غبار الطلع', 3],
]);

// لم يحدّد المالك سعرها بعد
const UNPRICED = ['جنسنغ كوري أحمر', 'طلع النخيل', 'زنجبيل', 'لوز', 'جوز', 'كاجو', 'فستق حلبي', 'بندق', 'بزور القرع'];

let products = 0;
for (const { name, price, weight } of PRODUCTS) {
  const res = await db.product.updateMany({ where: { name }, data: { price, weight } });
  products += res.count;
}

let priced = 0;
for (const [name, pricePerGram] of PRICED) {
  const res = await db.mixtureIngredient.updateMany({ where: { name }, data: { pricePerGram } });
  priced += res.count;
}

const zeroed = await db.mixtureIngredient.updateMany({
  where: { name: { in: UNPRICED }, pricePerGram: { not: 0 } },
  data: { pricePerGram: 0 },
});

const waiting = await db.mixtureIngredient.findMany({
  where: { pricePerGram: 0 },
  select: { name: true, mixture: { select: { name: true, customizable: true, published: true } } },
});
const affected = [
  ...new Set(waiting.filter((i) => i.mixture.customizable && i.mixture.published).map((i) => i.mixture.name)),
];

console.log(`منتجات: ${products} · أسعار مؤكَّدة: ${priced} · صُفّرت: ${zeroed.count}`);
if (affected.length)
  console.warn(`⚠ خلطات منشورة تُسعَّر بمكوّنات بلا سعر: ${affected.join('، ')}`);

await db.$disconnect();
