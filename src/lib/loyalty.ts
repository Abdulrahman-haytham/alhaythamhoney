/**
 * نقاط الولاء — حسابات خالصة مشتركة بين السلة والخادم والاختبارات.
 * القواعد كلها من إعدادات الأدمن: معدّل الكسب، قيمة النقطة، الحد الأدنى، النسبة القصوى، والسقف الشهري.
 */
export interface LoyaltyRules {
  loyaltyEnabled: boolean;
  pointsPerSyp: number;
  pointValue: number;
  minRedeemPoints: number;
  maxRedeemPercent: number;
  loyaltyMonthlyBudget: number;
}

/** نقاط تُمنح على مبلغ مؤكَّد (بعد الخصومات، قبل الشحن) */
export function pointsForAmount(amount: number, rules: Pick<LoyaltyRules, 'pointsPerSyp'>) {
  if (rules.pointsPerSyp <= 0 || amount <= 0) return 0;
  return Math.floor(amount / rules.pointsPerSyp);
}

export interface Redeemable {
  points: number;
  amount: number;
  /** سبب عدم الإمكان — للعرض */
  blocked: string | null;
}

/**
 * كم نقطة يمكن استبدالها الآن: لا تتجاوز الرصيد، ولا النسبة القصوى من المبلغ،
 * ولا ما تبقّى من ميزانية الشهر؛ ولا شيء تحت الحد الأدنى.
 */
export function redeemablePoints(params: {
  balance: number;
  amount: number;
  rules: LoyaltyRules;
  /** ما تبقّى من السقف الشهري بالليرة — null بلا سقف */
  remainingBudget: number | null;
}): Redeemable {
  const { balance, amount, rules, remainingBudget } = params;
  if (!rules.loyaltyEnabled || rules.pointValue <= 0)
    return { points: 0, amount: 0, blocked: null };
  if (balance < rules.minRedeemPoints)
    return {
      points: 0,
      amount: 0,
      blocked: `تحتاج ${rules.minRedeemPoints} نقطة على الأقل للاستبدال`,
    };
  const capByPercent = Math.floor((amount * rules.maxRedeemPercent) / 100);
  const capByBudget = remainingBudget === null ? Number.MAX_SAFE_INTEGER : remainingBudget;
  const maxAmount = Math.max(0, Math.min(capByPercent, capByBudget));
  const points = Math.min(balance, Math.floor(maxAmount / rules.pointValue));
  if (points <= 0)
    return {
      points: 0,
      amount: 0,
      blocked: capByBudget < rules.pointValue ? 'استُنفدت حصة الاستبدال لهذا الشهر' : null,
    };
  return { points, amount: points * rules.pointValue, blocked: null };
}

export const REFERRAL_STORAGE_KEY = 'alhaytham-ref';
export const REFERRAL_CODE_RE = /^[A-Z2-9]{6}$/;
