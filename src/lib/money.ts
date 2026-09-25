/**
 * تنسيق موحّد للمبالغ. الليرة السورية الجديدة (بعد حذف صفرين) هي عملة الموقع:
 * كل الأسعار في القاعدة وفي الإعدادات مخزّنة بها كأعداد صحيحة.
 */
export const CURRENCY = { code: 'SYP', label: 'ل.س' } as const;

const numberFormat = new Intl.NumberFormat('en-US');

/** رقم بفواصل الآلاف بلا رمز — لجداول ومواضع يظهر فيها الرمز مرة واحدة. */
export const formatAmount = (value: number) => numberFormat.format(Math.round(value));

/** المبلغ كاملاً برمز العملة، كما يُعرض للزائر في كل مكان. */
export const formatPrice = (value: number) => `${formatAmount(value)} ${CURRENCY.label}`;

/**
 * تُقرَّب أسعار الخلطات المركّبة لأقرب مضاعف لهذا الرقم حتى تبدو مألوفة لا حسابية.
 * بالليرة الجديدة، فخمس ليرات هنا تعادل خمسمئة قبل حذف الصفرين.
 */
export const PRICE_ROUNDING = 5;
