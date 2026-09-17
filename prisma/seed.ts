import { PrismaClient, ProductCategory } from '@prisma/client';
import { hashPassword } from '../src/lib/password';
import { SEED_ARTICLES, readSeedArticleBody } from './seed-articles';
import { SEED_GLOSSARY, SEED_GLOSSARY_CATEGORIES } from './seed-glossary';

const db = new PrismaClient();

interface SeedProduct {
  slug: string;
  name: string;
  desc: string;
  benefit?: string;
  image: string;
  badge?: string;
  price: number;
  weight: string;
  category: ProductCategory;
  sortOrder: number;
  detailedInfo?: {
    uses?: string[];
    benefits?: string[];
    properties?: string[];
    howToUse?: string;
  };
}

// المصدر: كتالوج المنتجات الحقيقي من النسخة السابقة (Vite SPA) — الأسعار/الأوزان
// أُضيفت كقيَم افتراضية معقولة للتطوير المحلي (لم تكن موجودة في الأصل).
const PRODUCTS: SeedProduct[] = [
  {
    slug: 'black-seed-honey',
    name: 'عسل حبة البركة',
    benefit: 'دعم المناعة',
    desc: 'القوة السوداء والشفاء العريق، مستخلص لضمان أعلى الفوائد المناعية.',
    image: '/images/products/black-seed-honey.webp',
    badge: 'الأكثر طلباً',
    price: 150000,
    weight: '500 غرام',
    category: 'HONEY',
    sortOrder: 0,
    detailedInfo: {
      benefits: [
        'تقوية الجهاز المناعي ومقاومة الأمراض',
        'مضاد للالتهابات والبكتيريا',
        'تحسين صحة الجهاز التنفسي',
        'دعم صحة القلب والأوعية الدموية',
        'مضاد للأكسدة يحمي الخلايا',
      ],
      uses: [
        'تناول ملعقة صباحاً على الريق',
        'مزجه مع الماء الدافئ والليمون',
        'استخدامه كبديل طبيعي للسكر',
        'تطبيقه موضعياً على الجروح',
      ],
      properties: [
        '100% عسل صافي طبيعي',
        'مستخلص من حبة البركة الأصيلة',
        'خالي من المواد الحافظة',
        'مختبر ومُختبر جودة',
      ],
      howToUse:
        'تناول ملعقة كبيرة (15-20 جرام) صباحاً على الريق أو قبل النوم. يمكن مزجه مع الماء الدافئ أو تناوله مباشرة. يُنصح بعدم تسخينه لدرجة عالية للحفاظ على خصائصه.',
    },
  },
  {
    slug: 'dardar-honey',
    name: 'عسل الدردار',
    benefit: 'طاقة وتنفس',
    desc: 'طعم الطبيعة السورية الأصيل، رحيق نادر يجسد عراقة الأرض.',
    image: '/images/products/dardar-honey.webp',
    price: 130000,
    weight: '500 غرام',
    category: 'HONEY',
    sortOrder: 1,
    detailedInfo: {
      benefits: [
        'تحسين وظائف الجهاز التنفسي',
        'مقاومة السعال والتهاب الحلق',
        'مصدر طبيعي للطاقة السريعة',
        'دعم صحة الجهاز الهضمي',
        'تعزيز النشاط البدني',
      ],
      uses: [
        'علاج طبيعي للسعال والبرد',
        'مصدر طاقة قبل التمارين',
        'تحلية المشروبات الساخنة',
        'تناول يومي للصحة العامة',
      ],
      properties: [
        'عسل نادر من أشجار الدردار',
        'نكهة مميزة وعميقة',
        'مستخرج من مراعي سورية',
        'طبيعي 100%',
      ],
      howToUse:
        'ملعقة كبيرة يومياً، خاصة في فصل الشتاء أو عند الشعور بالإرهاق. يمكن تناوله مع الشاي أو الماء الدافئ لتهدئة الحلق.',
    },
  },
  {
    slug: 'jejan-honey',
    name: 'عسل الجيجان',
    benefit: 'تغذية عامة',
    desc: 'نكهة برية فريدة لا تُنسى، يجمع من أزهار الجيجان البرية في البادية.',
    image: '/images/products/jejan-honey.webp',
    price: 120000,
    weight: '500 غرام',
    category: 'HONEY',
    sortOrder: 2,
    detailedInfo: {
      benefits: [
        'تغذية شاملة للجسم',
        'مصدر غني بالفيتامينات والمعادن',
        'تحسين الهضم والامتصاص',
        'دعم النمو والتطور',
        'تعزيز الطاقة والحيوية',
      ],
      uses: [
        'تغذية يومية متكاملة',
        'للأطفال والكبار',
        'مصدر طبيعي للكربوهيدرات',
        'دعم النظام الغذائي الصحي',
      ],
      properties: [
        'عسل بري من البادية',
        'نكهة قوية ومميزة',
        'غني بالإنزيمات الطبيعية',
        'مستخرج من أزهار الجيجان النادرة',
      ],
      howToUse:
        'ملعقة إلى ملعقتين يومياً كجزء من نظام غذائي متوازن. مناسب للاستخدام اليومي ولجميع أفراد العائلة.',
    },
  },
  {
    slug: 'qabbar-honey',
    name: 'عسل القبار',
    benefit: 'صحة الجهاز الهضمي',
    desc: 'عسل نادر مستخلص من أزهار نبتة القبار البرية، بنكهة مميزة وفوائد هضمية عريقة.',
    image: '/images/products/qabbar-honey.webp',
    price: 140000,
    weight: '500 غرام',
    category: 'HONEY',
    sortOrder: 6,
    detailedInfo: {
      benefits: [
        'دعم صحة الجهاز الهضمي وتحسين الامتصاص',
        'مضاد للالتهابات ومهدئ طبيعي للمعدة',
        'يساعد على تنظيم مستوى السكر في الدم',
        'غني بمضادات الأكسدة الطبيعية',
        'دعم صحة الكبد',
      ],
      uses: [
        'تناول ملعقة قبل الوجبات لتحسين الهضم',
        'مزجه مع الماء الدافئ صباحاً',
        'بديل طبيعي صحي للسكر',
      ],
      properties: [
        'مستخلص من أزهار القبار البرية النادرة',
        'نكهة مميزة وعطرية',
        '100% طبيعي بلا إضافات',
      ],
      howToUse: 'ملعقة كبيرة قبل الوجبة الرئيسية لدعم الهضم، أو صباحاً على الريق مع كوب ماء دافئ.',
    },
  },
  {
    slug: 'shawkiyat-honey',
    name: 'عسل الشوكيات السوري',
    benefit: 'دعم صحة الكبد',
    desc: 'عسل بري نادر مستخلص من نباتات الشوكيات السورية البرية، معروف بخصائصه الداعمة لصحة الكبد.',
    image: '/images/products/shawkiyat-honey.webp',
    price: 145000,
    weight: '500 غرام',
    category: 'HONEY',
    sortOrder: 7,
    detailedInfo: {
      benefits: [
        'دعم صحة الكبد وتعزيز وظائفه الطبيعية',
        'غني بمضادات الأكسدة',
        'مضاد طبيعي للالتهابات',
        'يساعد على تحسين عملية الهضم',
        'تعزيز مناعة الجسم بشكل عام',
      ],
      uses: [
        'تناول ملعقة يومياً لدعم صحة الكبد',
        'مزجه مع الماء الدافئ صباحاً على الريق',
        'بديل طبيعي صحي للسكر في المشروبات',
      ],
      properties: [
        'مستخلص من نباتات الشوكيات البرية السورية النادرة',
        'نكهة بريّة مميزة',
        '100% طبيعي بلا إضافات',
      ],
      howToUse:
        'ملعقة كبيرة صباحاً على الريق مع كوب ماء دافئ، أو حسب الحاجة كجزء من نظام غذائي داعم لصحة الكبد.',
    },
  },
  {
    slug: 'propolis',
    name: 'العكبر (Propolis)',
    benefit: 'درع مناعي طبيعي لجسمك',
    desc: 'يحميك من الالتهابات ويعزز دفاعات الجسم بشكل آمن وطبيعي. مثالي لمن يريد صحة يومية قوية بدون أدوية صناعية.',
    image: '/images/products/propolis.webp',
    price: 90000,
    weight: '50 غرام',
    category: 'SUPPLEMENT',
    sortOrder: 3,
  },
  {
    slug: 'royal-jelly',
    name: 'غذاء ملكات النحل',
    benefit: 'إكسير النشاط والحيوية',
    desc: 'طاقة وتركيز طوال اليوم. غذاء ملكي فاخر يدعم المناعة ويجدد النشاط.',
    image: '/images/products/royal-jelly.webp',
    badge: 'ملك الخلية',
    price: 110000,
    weight: '50 غرام',
    category: 'SUPPLEMENT',
    sortOrder: 4,
  },
  {
    slug: 'pollen',
    name: 'غبار الطلع',
    benefit: 'فيتامينات ومعادن من الطبيعة',
    desc: 'مكمل غذائي غني بالبروتين. مثالي للرياضيين ولمن يبحث عن طاقة طبيعية مستدامة.',
    image: '/images/products/pollen.webp',
    price: 80000,
    weight: '100 غرام',
    category: 'SUPPLEMENT',
    sortOrder: 5,
    detailedInfo: {
      benefits: [
        'مضاد حيوي طبيعي قوي',
        'تقوية الجهاز المناعي',
        'مقاومة الالتهابات والفيروسات',
        'شفاء الجروح والحروق',
        'دعم صحة الفم والأسنان',
      ],
      uses: [
        'مضغ قطعة صغيرة يومياً',
        'استخدامه كغرغرة للفم',
        'تطبيقه موضعياً على الجروح',
        'مكمل غذائي للوقاية',
      ],
      properties: ['مستخرج من خلايا النحل', 'غني بالفلافونويدات', 'مضاد أكسدة قوي', 'طبيعي 100%'],
      howToUse:
        'يمكن مضغ قطعة صغيرة (حجم حبة البازلاء) يومياً، أو استخدامه كغرغرة بعد إذابته في الماء. للاستخدام الموضعي، يُطبق مباشرة على المنطقة المصابة.',
    },
  },
];

interface SeedIngredient {
  name: string;
  note?: string;
  pricePerGram: number;
  minGrams: number;
  maxGrams: number;
  recommended: number;
  step?: number;
}

interface SeedMixture {
  slug: string;
  name: string;
  tagline: string;
  desc: string;
  image?: string;
  sizes: number[];
  defaultSize: number;
  prepFee: number;
  sortOrder: number;
  ingredients: SeedIngredient[];
}

// ⚠️ الأسعار للغرام والجرعات الموصى بها هنا قيَم افتراضية للانطلاق —
// أسعار غذاء الملكات والعكبر وغبار الطلع مشتقة من أسعار منتجاتها الحالية،
// أما الجنسنغ وطلع النخيل والزنجبيل والمكسرات فتقديرية ويجب ضبطها من لوحة التحكم.
// الحدود (الأدنى/الأقصى) حسب ما حدّده صاحب المتجر، وهي مطلقة لا تتغير مع حجم المرطبان.
const MIXTURES: SeedMixture[] = [
  {
    slug: 'royal',
    name: 'الملكية',
    tagline: 'للحيوية والتركيز',
    desc: 'غذاء ملكات النحل مع الجنسنغ الكوري الأحمر وطلع النخيل، في قاعدة من عسلك المفضّل. خلطة الطاقة والتركيز لمن يبدأ يومه بجدّية.',
    image: '/images/products/royal-jelly.webp',
    sizes: [250, 500, 1000],
    defaultSize: 500,
    prepFee: 10000,
    sortOrder: 0,
    ingredients: [
      {
        name: 'غذاء ملكات النحل',
        note: '30 غراماً تكفي جرعة يومية لشهر كامل',
        pricePerGram: 2200,
        minGrams: 20,
        maxGrams: 80,
        recommended: 30,
      },
      {
        name: 'جنسنغ كوري أحمر',
        note: 'جرعة معتدلة للنشاط دون إفراط',
        pricePerGram: 3000,
        minGrams: 10,
        maxGrams: 50,
        recommended: 20,
      },
      {
        name: 'طلع النخيل',
        note: 'غني بالمعادن ويوازن نكهة الجنسنغ',
        pricePerGram: 1500,
        minGrams: 10,
        maxGrams: 50,
        recommended: 20,
      },
    ],
  },
  {
    slug: 'whole-hive',
    name: 'الخليّة الكاملة',
    tagline: 'درعك المناعي',
    desc: 'كل ما تصنعه الخلية في مرطبان واحد: عسل وعكبر وغبار طلع وغذاء ملكات، مع لمسة زنجبيل. الخلطة الأشمل لدعم المناعة.',
    image: '/images/products/propolis.webp',
    sizes: [250, 500, 1000],
    defaultSize: 500,
    prepFee: 10000,
    sortOrder: 1,
    ingredients: [
      {
        name: 'العكبر (Propolis)',
        note: 'المضاد الحيوي الطبيعي في الخلية',
        pricePerGram: 1800,
        minGrams: 20,
        maxGrams: 50,
        recommended: 25,
      },
      {
        name: 'غبار الطلع',
        note: 'بروتين وفيتامينات — أساس هذه الخلطة',
        pricePerGram: 800,
        minGrams: 20,
        maxGrams: 100,
        recommended: 50,
      },
      {
        name: 'غذاء ملكات النحل',
        note: 'لمسة ملكية تكمّل المناعة بالحيوية',
        pricePerGram: 2200,
        minGrams: 10,
        maxGrams: 50,
        recommended: 20,
      },
      {
        name: 'زنجبيل',
        note: 'يدفّئ ويعزّز الامتصاص',
        pricePerGram: 200,
        minGrams: 5,
        maxGrams: 40,
        recommended: 15,
      },
    ],
  },
  {
    slug: 'morning',
    name: 'صباح الهيثم',
    tagline: 'فطور الملوك كل يوم',
    desc: 'مكسرات مختارة مغمورة بعسلك المفضّل. للمتعة والطعم وطاقة الصباح — اختر مكسراتك، أو استثنِ ما لا تحبه.',
    image: '/images/products/jejan-honey.webp',
    sizes: [750, 1000],
    defaultSize: 1000,
    prepFee: 5000,
    sortOrder: 2,
    ingredients: [
      { name: 'لوز', pricePerGram: 350, minGrams: 0, maxGrams: 150, recommended: 50, step: 10 },
      { name: 'جوز', pricePerGram: 400, minGrams: 0, maxGrams: 150, recommended: 50, step: 10 },
      { name: 'كاجو', pricePerGram: 450, minGrams: 0, maxGrams: 150, recommended: 50, step: 10 },
      {
        name: 'فستق حلبي',
        pricePerGram: 600,
        minGrams: 0,
        maxGrams: 150,
        recommended: 50,
        step: 10,
      },
    ],
  },
];

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Admin';

  if (
    !username ||
    !password ||
    password.length < 12 ||
    password.length > 256 ||
    /CHANGE_ME|ضع_كلمة/i.test(password)
  ) {
    throw new Error('اضبط ADMIN_USERNAME وكلمة مرور فعلية بين 12 و256 حرفاً.');
  }

  const admin = await db.admin.upsert({
    where: { username },
    update: {}, // Re-running seed must never reset an existing admin's password.
    create: { username, passwordHash: hashPassword(password), name, role: 'OWNER' },
  });

  console.log(`Admin "${admin.username}" جاهز.`);

  for (const product of PRODUCTS) {
    await db.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: { ...product, published: false, detailedInfo: product.detailedInfo ?? undefined },
    });
  }

  console.log(`${PRODUCTS.length} منتج جاهز.`);

  // الخلطات تُنشأ مرة واحدة فقط — بعدها تُعدَّل أسعارها وحدودها من لوحة التحكم لا من هنا
  for (const mixture of MIXTURES) {
    const exists = await db.mixture.findUnique({ where: { slug: mixture.slug } });
    if (exists) continue;
    await db.mixture.create({
      data: {
        ...mixture,
        published: false, // Prices and content must be reviewed before first publication.
        ingredients: {
          create: mixture.ingredients.map((ing, i) => ({ ...ing, sortOrder: i })),
        },
      },
    });
  }

  console.log(`${MIXTURES.length} خلطات جاهزة.`);

  // المقالات الأصلية تُزرع مرة واحدة، ثم تُكتب وتُعدَّل من /admin/articles فقط
  for (const article of SEED_ARTICLES) {
    const exists = await db.article.findUnique({
      where: { slug: article.slug },
      select: { id: true, body: true },
    });
    if (exists) {
      // نسخة قديمة زُرعت بجسم HTML خام؛ نرقّيها إلى Markdown ما دام الأدمن لم يعد كتابتها
      if (/^\s*</.test(exists.body))
        await db.article.update({
          where: { id: exists.id },
          data: { body: await readSeedArticleBody(article.slug) },
        });
      continue;
    }
    await db.article.create({
      data: {
        ...article,
        image: article.image ?? null,
        publishedAt: new Date(`${article.publishedAt}T00:00:00Z`),
        body: await readSeedArticleBody(article.slug),
        published: true, // محتوى منشور سابقاً على الموقع القديم — يبقى ظاهراً
      },
    });
  }

  console.log(`${SEED_ARTICLES.length} مقالات جاهزة.`);

  // موسوعة النحّال: محتوى تعليمي لا يُباع — يُزرع مرة واحدة ثم يُدار من /admin/glossary
  // مراحل الرحلة أولاً (مقدّمة/أيقونة/ترتيب) — update فارغ حتى لا تُمسّ تعديلات الأدمن
  for (const [index, category] of SEED_GLOSSARY_CATEGORIES.entries()) {
    await db.glossaryCategory.upsert({
      where: { name: category.name },
      update: {},
      create: { ...category, sortOrder: index },
    });
  }
  for (const [index, entry] of SEED_GLOSSARY.entries()) {
    await db.glossaryEntry.upsert({
      where: { slug: entry.slug },
      // لا نلمس مدخلاً عدّله الأدمن؛ الترتيب يأتي من ترتيب المصفوفة (مجموعات متجاورة)
      update: {},
      create: { ...entry, sortOrder: index },
    });
  }

  console.log(
    `${SEED_GLOSSARY.length} مدخل موسوعة في ${SEED_GLOSSARY_CATEGORIES.length} مراحل جاهزة.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
