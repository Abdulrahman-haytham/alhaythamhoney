import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../data-source';
import { Product, ProductDetailedInfo } from '../../modules/products/entities/product.entity';
import { ProductGroup } from '../../modules/products/entities/product-group.entity';
import { Article } from '../../modules/articles/entities/article.entity';

/**
 * One-shot migration of the legacy static data (data/products.tsx,
 * data/articles.ts, content/articles/*.md) into PostgreSQL.
 *
 * Idempotent: upserts by slug, so it can be re-run safely.
 */

interface SeedProduct {
  slug: string;
  name: string;
  description: string;
  benefit?: string;
  badge?: string;
  imageUrl: string;
  detailedInfo?: ProductDetailedInfo;
}

interface SeedGroup {
  slug: string;
  title: string;
  subtitle: string;
  layout: 'grid' | 'lab';
  iconName: string;
  products: SeedProduct[];
}

const GROUPS: SeedGroup[] = [
  {
    slug: 'core-honey',
    title: 'كنوز النحل – عسل صافي من مراعي مختارة',
    subtitle: 'نبدأ بما هو مألوف لنصل إلى أعماق النقاء',
    layout: 'grid',
    iconName: 'Droplets',
    products: [
      {
        slug: 'black-seed-honey',
        name: 'عسل حبة البركة',
        benefit: 'دعم المناعة',
        description:
          'القوة السوداء والشفاء العريق، مستخلص لضمان أعلى الفوائد المناعية.',
        imageUrl:
          'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=800',
        badge: 'الأكثر طلباً',
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
        description:
          'طعم الطبيعة السورية الأصيل، رحيق نادر يجسد عراقة الأرض.',
        imageUrl:
          'https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1768245563/my-app-uploads/bdtoimsuk9sjkirvpvbw.jpg',
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
        description:
          'نكهة برية فريدة لا تُنسى، يجمع من أزهار الجيجان البرية في البادية.',
        imageUrl:
          'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&q=80&w=800',
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
    ],
  },
  {
    slug: 'supplements',
    title: 'المكملات الحيوية – رفع القيمة',
    subtitle: 'منتجات طبيعية تُستخدم منذ قرون لدعم الجسد بذكاء',
    layout: 'grid',
    iconName: 'Sparkles',
    products: [
      {
        slug: 'propolis',
        name: 'العكبر (Propolis)',
        benefit: 'درع مناعي طبيعي لجسمك',
        description:
          'يحميك من الالتهابات ويعزز دفاعات الجسم بشكل آمن وطبيعي. مثالي لمن يريد صحة يومية قوية بدون أدوية صناعية.',
        imageUrl:
          'https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1769091916/my-app-uploads/mrtsg6k6rv9tj63pxmxv.jpg',
      },
      {
        slug: 'royal-jelly',
        name: 'غذاء ملكات النحل',
        benefit: 'إكسير النشاط والحيوية',
        description:
          'طاقة وتركيز طوال اليوم. غذاء ملكي فاخر يدعم المناعة ويجدد النشاط.',
        imageUrl:
          'https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1769091831/my-app-uploads/i40xuoyv6v171ppporjy.jpg',
        badge: 'ملك الخلية',
      },
      {
        slug: 'pollen',
        name: 'غبار الطلع',
        benefit: 'فيتامينات ومعادن من الطبيعة',
        description:
          'مكمل غذائي غني بالبروتين. مثالي للرياضيين ولمن يبحث عن طاقة طبيعية مستدامة.',
        imageUrl:
          'https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1769091882/my-app-uploads/seldz3u4kxhpfqeprkbs.jpg',
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
          properties: [
            'مستخرج من خلايا النحل',
            'غني بالفلافونويدات',
            'مضاد أكسدة قوي',
            'طبيعي 100%',
          ],
          howToUse:
            'يمكن مضغ قطعة صغيرة (حجم حبة البازلاء) يومياً، أو استخدامه كغرغرة بعد إذابته في الماء. للاستخدام الموضعي، يُطبق مباشرة على المنطقة المصابة.',
        },
      },
    ],
  },
];

interface SeedArticleMeta {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
}

const ARTICLES: SeedArticleMeta[] = [
  {
    slug: 'black-seed-honey-benefits',
    title: 'فوائد عسل حبة البركة الصحية',
    description:
      'اكتشف الفوائد الصحية المذهلة لعسل حبة البركة الطبيعي 100%، ودوره في دعم المناعة والصحة العامة.',
    keywords: ['عسل حبة البركة', 'فوائد العسل', 'دعم المناعة', 'عسل طبيعي', 'عسل نحل حبة البركة'],
  },
  {
    slug: 'how-to-identify-natural-honey',
    title: 'كيف تميّز العسل الطبيعي من المغشوش؟',
    description:
      'دليل شامل لتمييز العسل الطبيعي الأصيل من العسل المغشوش أو الصناعي، مع التركيز على الثقة والفحص المخبري.',
    keywords: ['تمييز العسل', 'عسل طبيعي', 'كشف غش العسل', 'جودة العسل', 'عسل مغشوش', 'ثقة في العسل'],
  },
  {
    slug: 'honey-crystallization',
    title: 'هل تبلور العسل دليل على الجودة والنقاء؟',
    description:
      'تعرف على حقيقة تبلور العسل ولماذا يعتبر علامة على العسل الطبيعي الأصلي، وكيف يؤثر على الفوائد الصحية.',
    keywords: ['تبلور العسل', 'عسل متبلور', 'جودة العسل', 'عسل طبيعي', 'عسل نقي', 'فوائد العسل'],
  },
  {
    slug: 'honey-for-children-cough',
    title: 'العسل الطبيعي لعلاج السعال عند الأطفال بأمان',
    description:
      'اكتشف كيف يساعد العسل الطبيعي على تهدئة السعال عند الأطفال بأمان، مع نصائح الجرعات الصحيحة والاحتياطات اللازمة.',
    keywords: ['عسل للأطفال', 'علاج السعال', 'عسل طبيعي', 'صحة الأطفال', 'عسل نقي', 'العلاج الطبيعي للسعال'],
  },
  {
    slug: 'honey-royal-jelly-sexual-health',
    title: 'العسل وغذاء ملكات النحل: تعزيز الصحة الجنسية',
    description:
      'اكتشف فوائد العسل وغذاء ملكات النحل في دعم الصحة الجنسية والطاقة الطبيعية، مع نصائح آمنة وطبيعية.',
    keywords: ['عسل طبيعي', 'غذاء ملكات النحل', 'الصحة الجنسية', 'تعزيز الطاقة', 'حيوية الجسم', 'عسل وصحة'],
  },
  {
    slug: 'honey-for-stomach-and-colon',
    title: 'العسل لعلاج جرثومة المعدة ومشاكل القولون',
    description:
      'تعرف على الوصفة الذهبية لاستخدام العسل في علاج جرثومة المعدة، الحموضة، وتهيج القولون العصبي بشكل طبيعي.',
    keywords: ['علاج جرثومة المعدة', 'عسل للقولون', 'علاج الحموضة', 'عسل طبيعي', 'المعدة', 'الجهاز الهضمي'],
  },
  {
    slug: 'secrets-of-bees-kingdom',
    title: 'أسرار مملكة النحل: مجتمع هندسي مدهش يفوق الخيال',
    description:
      'تعرف على خفايا عالم النحل ونظامه الاجتماعي الرائع، كيف يعمل هذا المجتمع بترتيب دقيق لإنتاج العسل وتلقيح النباتات، وما الذي يجعله من أذكى الكائنات في الطبيعة.',
    keywords: ['عالم النحل', 'ملكة النحل', 'تربية النحل', 'خلايا النحل', 'معلومات عن النحل', 'هندسة الطبيعة', 'النحل والعسل'],
  },
  {
    slug: 'best-honey-types-in-syria-guide',
    title: 'دليل أفضل أنواع العسل في سوريا: خصائصها وكيف تختار الأنسب لك',
    description:
      'دليل شامل من مؤسسة الهيثم نحل و عسل حول أفضل أنواع العسل في سوريا، خصائصها (حبة البركة، الجبلي، الزعتر، الشوكيات)، وكيف تختار الأنسب لصحتك وذوقك.',
    keywords: ['أفضل عسل في سوريا', 'أنواع العسل السوري', 'عسل حبة البركة', 'عسل جبلي', 'عسل شوكيات', 'عسل الهيثم', 'شراء عسل أصلي', 'عسل الزعتر', 'عسل الحمضيات'],
  },
  {
    slug: 'honey-in-ramadan-guide',
    title: 'العسل في رمضان: طاقة نقية لصيام متوازن وصحة أقوى',
    description:
      'تعرف على لماذا يُعد العسل الغذاء الأمثل للصائم، وكيف يساعد في طاقة السحور، توازن سكر الدم، ودعم الهضم والمناعة خلال شهر رمضان.',
    keywords: ['العسل في رمضان', 'سحور صحي', 'طاقة الصيام', 'فوائد العسل', 'صيام متوازن', 'غذاء الصائم'],
  },
];

const ARTICLES_DIR = path.resolve(__dirname, '../../../../content/articles');

async function seed() {
  await AppDataSource.initialize();
  console.log('🔌 Connected to database');

  const groupRepo = AppDataSource.getRepository(ProductGroup);
  const productRepo = AppDataSource.getRepository(Product);
  const articleRepo = AppDataSource.getRepository(Article);

  // ----- Product groups + products -----
  for (let gi = 0; gi < GROUPS.length; gi++) {
    const g = GROUPS[gi];
    let group = await groupRepo.findOne({ where: { slug: g.slug } });
    if (!group) group = groupRepo.create({ slug: g.slug });
    group.title = g.title;
    group.subtitle = g.subtitle;
    group.layout = g.layout;
    group.iconName = g.iconName;
    group.sortOrder = gi;
    group = await groupRepo.save(group);
    console.log(`📦 Group: ${g.slug}`);

    for (let pi = 0; pi < g.products.length; pi++) {
      const p = g.products[pi];
      let product = await productRepo.findOne({ where: { slug: p.slug } });
      if (!product) product = productRepo.create({ slug: p.slug });
      product.name = p.name;
      product.description = p.description;
      product.benefit = p.benefit ?? null;
      product.badge = p.badge ?? null;
      product.imageUrl = p.imageUrl;
      product.detailedInfo = p.detailedInfo ?? null;
      product.isActive = true;
      product.sortOrder = pi;
      product.group = group;
      await productRepo.save(product);
      console.log(`   🍯 Product: ${p.slug}`);
    }
  }

  // ----- Articles (content read from .md files) -----
  for (let ai = 0; ai < ARTICLES.length; ai++) {
    const a = ARTICLES[ai];
    const filePath = path.join(ARTICLES_DIR, `${a.slug}.md`);
    let content = '';
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch {
      console.warn(`   ⚠️  Missing markdown file for ${a.slug}, skipping content`);
    }

    let article = await articleRepo.findOne({ where: { slug: a.slug } });
    if (!article) article = articleRepo.create({ slug: a.slug });
    article.title = a.title;
    article.description = a.description;
    article.keywords = a.keywords;
    article.content = content;
    article.isPublished = true;
    article.sortOrder = ai;
    await articleRepo.save(article);
    console.log(`📝 Article: ${a.slug}`);
  }

  await AppDataSource.destroy();
  console.log('✅ Seed complete');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
