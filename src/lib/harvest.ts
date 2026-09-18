/**
 * رحلة القطاف — الهيكل معرفة مهنية ثابتة في الكود (الخطوات وأدواتها)،
 * أما نصوص الأدوات وصورها فتُقرأ من مداخل الموسوعة عبر الـ slugs، ووسائط «هكذا نعمل»
 * من الاستديو بوسم `StudioPhoto.tag` الذي يساوي `key` الخطوة.
 * خالص (بلا `'server-only'`) حتى يُستورد من العميل والاختبارات.
 */
export const HARVEST_STEPS = [
  {
    key: 'capping',
    title: 'ختم القرص',
    lead: 'النحل هو من يقرّر موعد القطاف، لا النحّال.',
    body: 'يهوّي النحل الرحيق بأجنحته حتى تنخفض رطوبته إلى نحو 17–18٪، ثم يختم كل عين بغطاء شمعي أبيض. هذا الختم هو شهادة النضج: عسل غير مختوم ما زال رطباً وقد يتخمّر في المرطبان. لذلك لا يُرفع إطار قبل أن يُختم معظمه.',
    toolSlugs: [],
  },
  {
    key: 'lifting',
    title: 'رفع الإطارات',
    lead: 'هدوء، دخان بارد، وحركة بطيئة.',
    body: 'نفثات قليلة من دخان بارد تُشغل الطائفة عن الدفاع، ثم يُنفض النحل عن الإطار بفرشاة ناعمة بدل الهزّ العنيف. الإطار الممتلئ يزن كيلوغرامات، فيُحمل بماسك يقبض على قمته دون أن تنزلق الأصابع إلى القرص.',
    toolSlugs: ['bee-smoker', 'bee-brush', 'frame-grip'],
  },
  {
    key: 'uncapping',
    title: 'كشف الأغطية',
    lead: 'إزالة الختم الشمعي دون جرح القرص.',
    body: 'يُمرَّر سكين الكشط (المسخَّن غالباً بماء ساخن) على وجه الإطار فيقصّ الطبقة الشمعية الرقيقة، وما تعذّر عليه في الزوايا المنخفضة تُفتح عيونه بشوكة الكشط. الأغطية نفسها لا تُهدر: تُصفّى ليُسترجع عسلها ويُصهر شمعها.',
    toolSlugs: ['uncapping-knife', 'uncapping-fork'],
  },
  {
    key: 'extracting',
    title: 'الفرز',
    lead: 'الطرد المركزي يفرغ القرص ويحفظه سليماً.',
    body: 'تُثبَّت الإطارات في الفرّاز ويُدار — يدوياً أو بمحرّك — فتقذف قوة الطرد المركزي العسل على جدار الوعاء وينساب إلى قاعه. الميزة أن القرص الشمعي يبقى سليماً فيُعاد إلى الخلية، ويوفّر النحل جهد بناء شمع جديد.',
    toolSlugs: ['honey-extractor-manual', 'honey-extractor-electric'],
  },
  {
    key: 'straining',
    title: 'التصفية',
    lead: 'شبكة لا حرارة.',
    body: 'من صنبور الفرّاز يمرّ العسل عبر مصفاة مزدوجة: شبكة خشنة تحجز قطع الشمع، ثم شبكة ناعمة للشوائب الدقيقة. لا تسخين ولا ترشيح دقيق يجرّد العسل من حبوب لقاحه — التصفية هنا ميكانيكية فقط.',
    toolSlugs: ['double-honey-strainer'],
  },
  {
    key: 'settling',
    title: 'الترقيد',
    lead: 'الصبر يصفّي ما لا تصفّيه الشبكة.',
    body: 'يُترك العسل في خزّان الترقيد أياماً قليلة في مكان دافئ. فقاعات الهواء التي دخلت أثناء الفرز وذرّات الشمع الأخفّ من العسل تصعد إلى السطح وتُكشط، ويبقى الأسفل صافياً جاهزاً للتعبئة.',
    toolSlugs: ['honey-settling-tank'],
  },
  {
    key: 'bottling',
    title: 'التعبئة',
    lead: 'من أسفل الخزّان إلى المرطبان بلا رغوة.',
    body: 'يُسحب العسل من صنبور في أسفل الدلو أو الخزّان، فيبقى ما طفا على السطح خلفه. التعبئة البطيئة على جدار المرطبان تمنع احتباس الهواء، ثم يُغلق المرطبان ويُلصق عليه رمز الدفعة.',
    toolSlugs: ['honey-bucket-with-gate', 'honey-gate'],
  },
  {
    key: 'passport',
    title: 'جواز الدفعة',
    lead: 'كل مرطبان يعرف من أين جاء.',
    body: 'الدفعة الواحدة ترتبط بمنحل وتاريخ قطاف ومصدر زهري ونتيجة فحص. الرمز المطبوع على الملصق يفتح جوازها، فيرى الزبون ما رأيناه نحن قبل أن نضع اسمنا عليه.',
    toolSlugs: [],
  },
] as const;

export type HarvestStepKey = (typeof HARVEST_STEPS)[number]['key'];
export type HarvestStep = (typeof HARVEST_STEPS)[number];

export const HARVEST_STEP_KEYS = HARVEST_STEPS.map((s) => s.key) as [
  HarvestStepKey,
  ...HarvestStepKey[],
];

export function isHarvestStepKey(value: string | null | undefined): value is HarvestStepKey {
  return !!value && (HARVEST_STEP_KEYS as readonly string[]).includes(value);
}

/** عنوان الخطوة لوسم الاستديو — يعرضه محرّر الاستديو في قائمة «ربط بمرحلة القطاف». */
export const HARVEST_STEP_LABELS: Record<HarvestStepKey, string> = Object.fromEntries(
  HARVEST_STEPS.map((s) => [s.key, s.title]),
) as Record<HarvestStepKey, string>;
