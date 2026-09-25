// تحديث خلطة «صباح الهيثم» على قاعدة قائمة: ستة مكسرات بوصفة مقفلة وسعر ثابت.
// البذرة تنشئ الخلطات مرة واحدة فقط، فلا تصل تعديلاتها إلى قاعدة تعمل.
// آمن ويُعاد تشغيله: يضبط الحالة النهائية ولا يعتمد على ما كان قبله.
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const SLUG = 'morning';
const GRAMS = 50;

// سعر الغرام لا أثر له ما دامت الوصفة مقفلة؛ صفر يعني «لم يُسعَّر بعد»
const NUTS = [
  { name: 'كاجو', pricePerGram: 5 },
  { name: 'لوز', pricePerGram: 4 },
  { name: 'فستق حلبي', pricePerGram: 6 },
  { name: 'بندق', pricePerGram: 0 },
  { name: 'جوز', pricePerGram: 4 },
  { name: 'بزور القرع', pricePerGram: 0 },
];

const mixture = await db.mixture.findUnique({
  where: { slug: SLUG },
  include: { ingredients: true },
});
if (!mixture) {
  console.error(`لا خلطة بالمعرّف «${SLUG}» — شغّل db:seed أولاً.`);
  process.exit(1);
}

await db.$transaction(async (tx) => {
  await tx.mixture.update({
    where: { id: mixture.id },
    data: {
      sizes: [500],
      defaultSize: 500,
      customizable: false,
      fixedPrice: 1000,
      desc: 'ستة مكسرات مغمورة بالعسل: كاجو ولوز وفستق حلبي وبندق وجوز وبزور القرع. وصفة واحدة نحضّرها بمقاديرها كما هي — ملعقة على الفطور تكفي.',
    },
  });

  const keep = new Set();
  for (const [i, nut] of NUTS.entries()) {
    const row = {
      minGrams: GRAMS,
      maxGrams: GRAMS,
      recommended: GRAMS,
      step: 10,
      sortOrder: i,
      ...nut,
    };
    const existing = mixture.ingredients.find((x) => x.name === nut.name);
    if (existing) {
      await tx.mixtureIngredient.update({ where: { id: existing.id }, data: row });
      keep.add(existing.id);
    } else {
      const created = await tx.mixtureIngredient.create({
        data: { ...row, mixtureId: mixture.id },
      });
      keep.add(created.id);
    }
  }
  const stale = mixture.ingredients.filter((x) => !keep.has(x.id)).map((x) => x.id);
  if (stale.length) await tx.mixtureIngredient.deleteMany({ where: { id: { in: stale } } });
  console.log(`مكوّنات مضبوطة: ${NUTS.length} · محذوفة: ${stale.length}`);
});

await db.$disconnect();
