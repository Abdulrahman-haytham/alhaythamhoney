/** تهريب النص المتغيّر عند حدّ HTML الأخير — أسماء الزبائن وملاحظاتهم تدخل قوالب البريد. */
export function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c]!,
  );
}
