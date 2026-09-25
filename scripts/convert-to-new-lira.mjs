// تحويل لمرّة واحدة من الليرة القديمة إلى الجديدة (حذف صفرين).
// آمن ويُعاد تشغيله بلا ضرر: لا يلمس إلا القيم التي ما زالت على الرقم القديم المعروف.
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// أسعار منتجات الخلية من كتالوجنا نفسه، والباقي محوَّل من القديم
const INGREDIENT_PRICES = new Map([
  ['غذاء ملكات النحل', { from: 2200, to: 100 }],
  ['العكبر (Propolis)', { from: 1800, to: 10 }],
  ['غبار الطلع', { from: 800, to: 4 }],
  ['جنسنغ كوري أحمر', { from: 3000, to: 30 }],
  ['طلع النخيل', { from: 1500, to: 15 }],
  ['زنجبيل', { from: 200, to: 2 }],
  ['لوز', { from: 350, to: 4 }],
  ['جوز', { from: 400, to: 4 }],
  ['كاجو', { from: 450, to: 5 }],
  ['فستق حلبي', { from: 600, to: 6 }],
]);
const PREP_FEES = new Map([
  [10000, 100],
  [5000, 50],
]);

let ing = 0;
for (const [name, { from, to }] of INGREDIENT_PRICES) {
  const res = await db.mixtureIngredient.updateMany({
    where: { name, pricePerGram: from },
    data: { pricePerGram: to },
  });
  ing += res.count;
}

let fees = 0;
for (const [from, to] of PREP_FEES) {
  const res = await db.mixture.updateMany({ where: { prepFee: from }, data: { prepFee: to } });
  fees += res.count;
}

// الإعدادات: الصفّ قد لا يكون موجوداً أصلاً، وعندها يعمل الموقع بافتراضيات الكود الصحيحة
const SETTINGS = [
  ['shippingCost', 25000, 250],
  ['freeShippingThreshold', 500000, 6000],
  ['pointsPerSyp', 10000, 100],
  ['pointValue', 500, 5],
  ['referralMaxDiscount', 50000, 500],
  ['welcomeMaxDiscount', 50000, 500],
];
let settings = 0;
for (const [field, from, to] of SETTINGS) {
  const res = await db.siteSettings.updateMany({ where: { [field]: from }, data: { [field]: to } });
  settings += res.count;
}

// أسعار المنتجات: القسمة على مئة، ولا يُمسّ منتج غادر سعره القديم المعروف
const PRODUCT_PRICES = new Map([
  ['عسل حبة البركة', [150000, 1500]],
  ['عسل الدردار', [130000, 1300]],
  ['عسل الجيجان', [120000, 1200]],
  ['عسل القبار', [140000, 1400]],
  ['عسل الشوكيات السوري', [145000, 1450]],
  ['العكبر (Propolis)', [90000, 900]],
  ['غذاء ملكات النحل', [110000, 1100]],
  ['غبار الطلع', [80000, 800]],
]);
let products = 0;
for (const [name, [from, to]] of PRODUCT_PRICES) {
  const res = await db.product.updateMany({ where: { name, price: from }, data: { price: to } });
  products += res.count;
}

// شرائح الكميات في هذا المخطط نِسَب مئوية لا مبالغ، فلا شيء يُحوَّل فيها.
// أجور مناطق الشحن مبالغ، فتُقسم على مئة.
const zones = await db.shippingZone.findMany({ select: { id: true, cost: true } });
let zoneCount = 0;
for (const z of zones) {
  if (z.cost >= 5000) {
    await db.shippingZone.update({ where: { id: z.id }, data: { cost: Math.round(z.cost / 100) } });
    zoneCount += 1;
  }
}

console.log(`منتجات: ${products} · مناطق شحن: ${zoneCount}`);

console.log(`مكوّنات: ${ing} · أجور تحضير: ${fees} · حقول إعدادات: ${settings}`);
await db.$disconnect();
