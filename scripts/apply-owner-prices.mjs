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
  { name: 'غبار الطلع', price: 300, weight: '100 غرام' },
];

// سعر الغرام المؤكَّد من المالك
const PRICED = new Map([
  ['غذاء ملكات النحل', 100],
  ['العكبر (Propolis)', 10],
  ['غبار الطلع', 3],
]);

// لم يحدّد المالك سعرها بعد
const UNPRICED = [
  'جنسنغ كوري أحمر',
  'طلع النخيل',
  'زنجبيل',
  'لوز',
  'جوز',
  'كاجو',
  'فستق حلبي',
  'بندق',
  'بزور القرع',
];

let products = 0;
for (const { name, price, weight } of PRODUCTS) {
  const res = await db.product.updateMany({ where: { name }, data: { price, weight } });
  products += res.count;
}

// قاعدة المالك: كل الأعسال بسعر واحد، الكيلو ٢٠٠٠ ⇒ ليرتان للغرام مهما كانت العبوة.
// تُطبَّق على السعر المحسوب لا على قيمة سابقة بعينها، فتصحّ أياً كان ما في القاعدة.
const HONEY_PER_GRAM = 2;
const gramsOf = (weight) => {
  const t = String(weight ?? '')
    .trim()
    .replace(/[٠-٩]/g, (n) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(n)))
    .replace('٫', '.');
  const m = t.match(/^(\d+(?:\.\d+)?)\s*(غرام|جرام|غ|جم|g|كغ|كجم|كيلو(?:غرام)?|kg)?$/i);
  if (!m) return null;
  const kg = /^(كغ|كجم|كيلو(?:غرام)?|kg)$/i.test(m[2] ?? '');
  return Math.round(Number(m[1]) * (kg ? 1000 : 1));
};

const honeys = await db.product.findMany({
  where: { category: 'HONEY' },
  select: { id: true, name: true, price: true, weight: true },
});
let honeyFixed = 0;
for (const h of honeys) {
  const grams = gramsOf(h.weight);
  if (!grams) {
    console.warn(`⚠ وزن غير مفهوم، تُرك سعره كما هو: ${h.name} (${h.weight})`);
    continue;
  }
  const price = grams * HONEY_PER_GRAM;
  if (h.price === price) continue;
  await db.product.update({ where: { id: h.id }, data: { price } });
  console.log(`  ${h.name} (${h.weight}): ${h.price} ← ${price}`);
  honeyFixed += 1;
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
  ...new Set(
    waiting.filter((i) => i.mixture.customizable && i.mixture.published).map((i) => i.mixture.name),
  ),
];

console.log(
  `منتجات: ${products} · أعسال مسعّرة: ${honeyFixed} · أسعار مؤكَّدة: ${priced} · صُفّرت: ${zeroed.count}`,
);
if (affected.length)
  console.warn(`⚠ خلطات منشورة تُسعَّر بمكوّنات بلا سعر: ${affected.join('، ')}`);

await db.$disconnect();
