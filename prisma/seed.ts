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
    desc: 'عسل حبة البركة من رحيق Nigella sativa: لون عنبري داكن وطعم قوي مركّز مع حدّة خفيفة. من مناحلنا في ريف حماة، مفحوص مخبرياً وبجواز دفعة.',
    image: '/images/products/black-seed-honey.webp',
    badge: 'الأكثر طلباً',
    price: 1000,
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
    desc: 'عسل الدردار السوري: رحيق نادر من مراعي ريف حماة بلون كهرماني وطعم متوازن. يُقطف في موسمه ويصل إليك بجواز دفعة وتاريخ قطاف.',
    image: '/images/products/dardar-honey.webp',
    price: 1000,
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
    desc: 'عسل الجيجان البري من أزهار البادية السورية: نكهة برية مميّزة وإنتاج محدود بحكم تفرّق النبتة. مفحوص مخبرياً وبجواز دفعة لكل مرطبان.',
    image: '/images/products/jejan-honey.webp',
    price: 1000,
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
    desc: 'عسل القبار السوري النادر: من زهرة برية تتفتح ليلاً وتذبل نهاراً، فلا يُنتج إلا بكميات محدودة. كهرماني داكن بطعم حادّ مميّز، بجواز دفعة.',
    image: '/images/products/qabbar-honey.webp',
    price: 1000,
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
    desc: 'عسل الشوكيات السوري: من الخرفيش وشوك الجمل والقنطريون التي تفرز رحيقها في عزّ الحرّ. ذهبي فاتح بطعم متوازن يناسب الاستعمال اليومي.',
    image: '/images/products/shawkiyat-honey.webp',
    price: 1000,
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
    desc: 'العكبر (البروبوليس): راتنج تجمعه النحلات من براعم الأشجار وتحصّن به الخلية. يُعرف تقليدياً بدعم الحلق واللثة والمناعة. ٥٠ غراماً من مناحلنا.',
    image: '/images/products/propolis.webp',
    price: 500,
    weight: '50 غرام',
    category: 'SUPPLEMENT',
    sortOrder: 3,
    detailedInfo: {
      uses: [
        'يُذاب قليل منه في ماء دافئ للغرغرة عند خشونة الحلق',
        'يُمزج مع العسل لملعقة صباحية في مواسم البرد',
        'يُستعمل موضعياً على اللثة بكميات صغيرة',
        'يُضاف إلى مشروب دافئ للاستعمال اليومي المعتدل',
      ],
      benefits: [
        'يُعرف تقليدياً بدعم الحلق واللثة',
        'غني بالمركّبات الفينولية ومضادات الأكسدة',
        'يُستعمل شعبياً لدعم المناعة في فصل الشتاء',
        'مادة طبيعية بالكامل يجمعها النحل لا تُصنَّع',
      ],
      properties: [
        'راتنج تجمعه النحلات من براعم الأشجار وقشورها',
        'لون بني مائل للخضرة، ورائحة راتنجية قوية',
        'يتصلّب بالبرودة ويلين بحرارة اليد',
      ],
      howToUse:
        'ابدأ بكمية صغيرة جداً (بحجم حبة العدس) لاختبار تقبّلك له. يُحفظ في مكان بارد بعيداً عن الضوء. لا يُعطى للأطفال دون سنة، ويُتجنّب عند وجود حساسية من منتجات النحل.',
    },
  },
  {
    slug: 'royal-jelly',
    name: 'غذاء ملكات النحل',
    benefit: 'إكسير النشاط والحيوية',
    desc: 'غذاء ملكات النحل: إفراز تصنعه الشغالات الحاضنة وتتغذى عليه الملكة وحدها مدى حياتها. غني بالبروتينات، يُحفظ بارداً. عبوة ١٠ غرامات طازجة من مناحلنا.',
    image: '/images/products/royal-jelly.webp',
    badge: 'ملك الخلية',
    price: 1000,
    weight: '10 غرام',
    category: 'SUPPLEMENT',
    sortOrder: 4,
    detailedInfo: {
      uses: [
        'ملعقة صغيرة على الريق تُذاب تحت اللسان',
        'يُمزج مع العسل لتسهيل تناوله وحفظه',
        'يُستعمل في فترات الإجهاد والنقاهة',
        'يُضاف إلى برنامج غذائي متوازن لا كبديل عنه',
      ],
      benefits: [
        'غني بالبروتينات والأحماض الأمينية وفيتامينات B',
        'يُعرف تقليدياً بدعم النشاط والحيوية',
        'يُستعمل شعبياً لدعم الخصوبة والمناعة',
        'غذاء طبيعي كامل لا يحتوي أي إضافات',
      ],
      properties: [
        'إفراز لبني تصنعه الشغالات الحاضنة من غددها',
        'يتغذى عليه يرقات النحل ثلاثة أيام، والملكة مدى حياتها',
        'قوام كريمي أبيض مائل للاصفرار وطعم حامضي لاذع',
      ],
      howToUse:
        'يُحفظ في الثلاجة دائماً — الحرارة تُفقده خصائصه سريعاً. ابدأ بكمية صغيرة، وتجنّبه عند الحساسية من منتجات النحل. ليس دواءً ولا يُغني عن استشارة الطبيب عند وجود حالة صحية.',
    },
  },
  {
    slug: 'pollen',
    name: 'غبار الطلع',
    benefit: 'فيتامينات ومعادن من الطبيعة',
    desc: 'غبار الطلع: حبوب لقاح تجمعها النحلات من الأزهار وتكبسها في سلال أرجلها. غذاء متكامل غني بالبروتين. من مراعي ريف حماة، مفحوص ومعبّأ عندنا.',
    image: '/images/products/pollen.webp',
    price: 300,
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

// المبالغ كلها بالليرة الجديدة: أسعار منتجات الخلية من كتالوجنا نفسه
// (غذاء الملكات ١٠٠/غرام، العكبر ١٠، غبار الطلع ٣)، وبقية المكوّنات محوّلة من القديمة.
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
  /** false ⇒ وصفة مقفلة يشتريها الزبون كما هي */
  customizable?: boolean;
  /** سعر المرطبان حين تُقفل الوصفة */
  fixedPrice?: number;
  ingredients: SeedIngredient[];
}

// ⚠️ سعر الغرام صفر يعني «لم يحدّده المالك بعد» لا «مجاني»: الجنسنغ وطلع النخيل
// والزنجبيل والمكسرات تنتظر أسعارها من لوحة التحكم، ولا يُخمَّن لها رقم هنا.
// المؤكَّد من المالك: غذاء الملكات ١٠٠ للغرام، العكبر ١٠، غبار الطلع ٣.
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
    prepFee: 100,
    sortOrder: 0,
    ingredients: [
      {
        name: 'غذاء ملكات النحل',
        note: '30 غراماً تكفي جرعة يومية لشهر كامل',
        pricePerGram: 100,
        minGrams: 20,
        maxGrams: 80,
        recommended: 30,
      },
      {
        name: 'جنسنغ كوري أحمر',
        note: 'جرعة معتدلة للنشاط دون إفراط',
        pricePerGram: 0,
        minGrams: 10,
        maxGrams: 50,
        recommended: 20,
      },
      {
        name: 'طلع النخيل',
        note: 'غني بالمعادن ويوازن نكهة الجنسنغ',
        pricePerGram: 0,
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
    prepFee: 100,
    sortOrder: 1,
    ingredients: [
      {
        name: 'العكبر (Propolis)',
        note: 'المضاد الحيوي الطبيعي في الخلية',
        pricePerGram: 10,
        minGrams: 20,
        maxGrams: 50,
        recommended: 25,
      },
      {
        name: 'غبار الطلع',
        note: 'بروتين وفيتامينات — أساس هذه الخلطة',
        pricePerGram: 3,
        minGrams: 20,
        maxGrams: 100,
        recommended: 50,
      },
      {
        name: 'غذاء ملكات النحل',
        note: 'لمسة ملكية تكمّل المناعة بالحيوية',
        pricePerGram: 100,
        minGrams: 10,
        maxGrams: 50,
        recommended: 20,
      },
      {
        name: 'زنجبيل',
        note: 'يدفّئ ويعزّز الامتصاص',
        pricePerGram: 0,
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
    desc: 'ستة مكسرات مغمورة بالعسل: كاجو ولوز وفستق حلبي وبندق وجوز وبزور القرع. وصفة واحدة نحضّرها بمقاديرها كما هي — ملعقة على الفطور تكفي.',
    image: '/images/products/jejan-honey.webp',
    sizes: [500],
    defaultSize: 500,
    prepFee: 50,
    sortOrder: 2,
    // وصفة مقفلة بسعر يضبطه المالك؛ المقادير متساوية فلا يُرجَّح مكسّر على آخر
    customizable: false,
    fixedPrice: 1000,
    ingredients: [
      { name: 'كاجو', pricePerGram: 0, minGrams: 50, maxGrams: 50, recommended: 50, step: 10 },
      { name: 'لوز', pricePerGram: 0, minGrams: 50, maxGrams: 50, recommended: 50, step: 10 },
      {
        name: 'فستق حلبي',
        pricePerGram: 0,
        minGrams: 50,
        maxGrams: 50,
        recommended: 50,
        step: 10,
      },
      // سعر الغرام لهذين لم يُحدَّد بعد؛ لا أثر له ما دامت الوصفة مقفلة بسعر ثابت
      { name: 'بندق', pricePerGram: 0, minGrams: 50, maxGrams: 50, recommended: 50, step: 10 },
      { name: 'جوز', pricePerGram: 0, minGrams: 50, maxGrams: 50, recommended: 50, step: 10 },
      {
        name: 'بزور القرع',
        pricePerGram: 0,
        minGrams: 50,
        maxGrams: 50,
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
    const { productSlugs, ...data } = article;
    const connect = productSlugs?.length ? productSlugs.map((slug) => ({ slug })) : [];
    const exists = await db.article.findUnique({
      where: { slug: article.slug },
      select: { id: true, body: true, _count: { select: { products: true } } },
    });
    if (exists) {
      // نسخة قديمة زُرعت بجسم HTML خام؛ نرقّيها إلى Markdown ما دام الأدمن لم يعد كتابتها
      if (/^\s*</.test(exists.body))
        await db.article.update({
          where: { id: exists.id },
          data: { body: await readSeedArticleBody(article.slug) },
        });
      // ربط المنتجات يُملأ مرة واحدة فقط — لا يُلغي اختيار الأدمن إن سبق أن ربط شيئاً
      if (connect.length && exists._count.products === 0)
        await db.article.update({ where: { id: exists.id }, data: { products: { connect } } });
      continue;
    }
    await db.article.create({
      data: {
        ...data,
        image: article.image ?? null,
        publishedAt: new Date(`${article.publishedAt}T00:00:00Z`),
        body: await readSeedArticleBody(article.slug),
        published: true, // محتوى منشور سابقاً على الموقع القديم — يبقى ظاهراً
        ...(connect.length ? { products: { connect } } : {}),
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
