/**
 * أرقام واتساب: الصيغة المخزّنة دولية بأرقام فقط بلا + (963944123456) — هي ما يفهمه
 * واتساب وما يُفهرس عليه حساب الزبون. يقبل ما يكتبه الناس فعلاً: 0944…، 944…، +963…،
 * 00963…، بأرقام عربية أو فارسية ومسافات وشرطات.
 */
const SY = '963';

export function toLatinDigits(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

export function normalizeWhatsAppNumber(input: string): string | null {
  const raw = toLatinDigits(String(input ?? '')).trim();
  if (!/^[+\d\s().-]+$/.test(raw)) return null;
  const international = raw.startsWith('+') || raw.startsWith('00');
  let d = raw.replace(/\D/g, '');
  if (raw.startsWith('00')) d = d.slice(2);

  if (!international) {
    // محلي سوري: 09xxxxxxxx أو 9xxxxxxxx
    if (/^09\d{8}$/.test(d)) return SY + d.slice(1);
    if (/^9\d{8}$/.test(d)) return SY + d;
    // أو كُتب الرمز الدولي دون +
    if (/^9639\d{8}$/.test(d)) return d;
    return null;
  }
  // سوريا: خلوي فقط (9 بعد الرمز) — صفر زائد بعد الرمز شائع (+963 09…)
  if (d.startsWith(SY)) {
    const rest = d.slice(3).replace(/^0/, '');
    return /^9\d{8}$/.test(rest) ? SY + rest : null;
  }
  // دولي آخر (مغترب يطلب لأهله): E.164 من 8 إلى 15 رقماً
  return /^[1-9]\d{7,14}$/.test(d) ? d : null;
}

/** للعرض: 0944 123 456 للسوري، و+<الرقم> لغيره. */
export function formatPhone(number: string): string {
  if (/^9639\d{8}$/.test(number)) {
    const local = '0' + number.slice(3);
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }
  return `+${number}`;
}
