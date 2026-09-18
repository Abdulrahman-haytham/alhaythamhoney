/**
 * شاشة افتتاح بشعار الهيثم — تظهر لحظة ثم تنزاح بمؤقّت CSS (`.boot-veil`)،
 * لا بانتظار اكتمال ترطيب React كما كانت. الفرق ليس تجميلياً: الشاشة التي تغطّي
 * المحتوى حتى الترطيب تؤجّل ما يقيسه كروم كـ LCP نحو ثانية كاملة على الجوال،
 * وهو أحد عوامل ترتيب البحث. تعمل الآن بلا JavaScript أيضاً.
 */
export default function BootLoader() {
  return (
    <div className="boot-veil" aria-hidden>
      <haytham-loader
        active
        overlay
        theme="dark"
        label="جارٍ التحميل…"
        style={
          {
            '--haytham-size': '190px',
            '--haytham-overlay-background': '#09090b',
          } as React.CSSProperties
        }
      />
    </div>
  );
}
