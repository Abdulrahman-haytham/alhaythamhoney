// src/data/articles.ts
import blackSeedHoneyBenefitsContent from '../content/articles/black-seed-honey-benefits.md?raw';
import howToIdentifyNaturalHoneyContent from '../content/articles/how-to-identify-natural-honey.md?raw';
import honeyCrystallizationContent from '../content/articles/honey-crystallization.md?raw';
import honeyForChildrenCoughContent from '../content/articles/honey-for-children-cough.md?raw';
import honeyRoyalJellySexualHealthContent from '../content/articles/honey-royal-jelly-sexual-health.md?raw';
import honeyForStomachAndColonContent from '../content/articles/honey-for-stomach-and-colon.md?raw';
import secretsOfBeesKingdomContent from '../content/articles/secrets-of-bees-kingdom.md?raw';
import bestHoneyTypesInSyriaGuideContent from '../content/articles/best-honey-types-in-syria-guide.md?raw';
import honeyInRamadanGuideContent from '../content/articles/honey-in-ramadan-guide.md?raw';


export interface Article {
    id: string;
    title: string;
    description: string;
    content: string;
    keywords: string[];
    image?: string;
  }
  
  export const articles: Article[] = [
    {
      id: 'black-seed-honey-benefits',
      title: 'فوائد عسل حبة البركة الصحية',
      description: 'اكتشف الفوائد الصحية المذهلة لعسل حبة البركة الطبيعي 100%، ودوره في دعم المناعة والصحة العامة.',
      keywords: ['عسل حبة البركة', 'فوائد العسل', 'دعم المناعة', 'عسل طبيعي', 'عسل نحل حبة البركة'],
      content: blackSeedHoneyBenefitsContent
    },
    {
      id: 'how-to-identify-natural-honey',
      title: 'كيف تميّز العسل الطبيعي من المغشوش؟',
      description: 'دليل شامل لتمييز العسل الطبيعي الأصيل من العسل المغشوش أو الصناعي، مع التركيز على الثقة والفحص المخبري.',
      keywords: ['تمييز العسل', 'عسل طبيعي', 'كشف غش العسل', 'جودة العسل', 'عسل مغشوش', 'ثقة في العسل'],
      content: howToIdentifyNaturalHoneyContent
    },
    {
      id: 'honey-crystallization',
      title: 'هل تبلور العسل دليل على الجودة والنقاء؟',
      description: 'تعرف على حقيقة تبلور العسل ولماذا يعتبر علامة على العسل الطبيعي الأصلي، وكيف يؤثر على الفوائد الصحية.',
      keywords: ['تبلور العسل', 'عسل متبلور', 'جودة العسل', 'عسل طبيعي', 'عسل نقي', 'فوائد العسل'],
      content: honeyCrystallizationContent
    },
    {
      id: 'honey-for-children-cough',
      title: 'العسل الطبيعي لعلاج السعال عند الأطفال بأمان',
      description: 'اكتشف كيف يساعد العسل الطبيعي على تهدئة السعال عند الأطفال بأمان، مع نصائح الجرعات الصحيحة والاحتياطات اللازمة.',
      keywords: ['عسل للأطفال', 'علاج السعال', 'عسل طبيعي', 'صحة الأطفال', 'عسل نقي', 'العلاج الطبيعي للسعال'],
      content: honeyForChildrenCoughContent
    },
    {
      id: 'honey-royal-jelly-sexual-health',
      title: 'العسل وغذاء ملكات النحل: تعزيز الصحة الجنسية',
      description: 'اكتشف فوائد العسل وغذاء ملكات النحل في دعم الصحة الجنسية والطاقة الطبيعية، مع نصائح آمنة وطبيعية.',
      keywords: ['عسل طبيعي', 'غذاء ملكات النحل', 'الصحة الجنسية', 'تعزيز الطاقة', 'حيوية الجسم', 'عسل وصحة'],
      content: honeyRoyalJellySexualHealthContent
    },
    {
        id: 'honey-for-stomach-and-colon',
        title: 'العسل لعلاج جرثومة المعدة ومشاكل القولون',
        description: 'تعرف على الوصفة الذهبية لاستخدام العسل في علاج جرثومة المعدة، الحموضة، وتهيج القولون العصبي بشكل طبيعي.',
        keywords: ['علاج جرثومة المعدة', 'عسل للقولون', 'علاج الحموضة', 'عسل طبيعي', 'المعدة', 'الجهاز الهضمي'],
        content: honeyForStomachAndColonContent
      },
      {
        
  id: 'secrets-of-bees-kingdom',
  title: 'أسرار مملكة النحل: مجتمع هندسي مدهش يفوق الخيال',
  description: 'تعرف على خفايا عالم النحل ونظامه الاجتماعي الرائع، كيف يعمل هذا المجتمع بترتيب دقيق لإنتاج العسل وتلقيح النباتات، وما الذي يجعله من أذكى الكائنات في الطبيعة.',
  keywords: ['عالم النحل', 'ملكة النحل', 'تربية النحل', 'خلايا النحل', 'معلومات عن النحل', 'هندسة الطبيعة', 'النحل والعسل'],
  content: secretsOfBeesKingdomContent
  },
  {
    id: 'best-honey-types-in-syria-guide',
    title: 'دليل أفضل أنواع العسل في سوريا: خصائصها وكيف تختار الأنسب لك',
    description: 'دليل شامل من مؤسسة الهيثم لنحل وعسل حول أفضل أنواع العسل في سوريا، خصائصها (حبة البركة، الجبلي، الزعتر، الشوكيات)، وكيف تختار الأنسب لصحتك وذوقك.',
    keywords: ['أفضل عسل في سوريا', 'أنواع العسل السوري', 'عسل حبة البركة', 'عسل جبلي', 'عسل شوكيات', 'عسل الهيثم', 'شراء عسل أصلي', 'عسل الزعتر', 'عسل الحمضيات'],
    content: bestHoneyTypesInSyriaGuideContent
  },
  {
    id: 'honey-in-ramadan-guide',
    title: 'العسل في رمضان: طاقة نقية لصيام متوازن وصحة أقوى',
    description: 'تعرف على لماذا يُعد العسل الغذاء الأمثل للصائم، وكيف يساعد في طاقة السحور، توازن سكر الدم، ودعم الهضم والمناعة خلال شهر رمضان.',
    keywords: [
      'العسل في رمضان',
      'سحور صحي',
      'طاقة الصيام',
      'فوائد العسل',
      'صيام متوازن',
      'غذاء الصائم'
    ],
    content: honeyInRamadanGuideContent
  }
];