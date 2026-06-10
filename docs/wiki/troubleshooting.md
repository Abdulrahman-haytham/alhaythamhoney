# حل المشاكل الشائعة (Troubleshooting)

## الصفحة لا تفتح عند الدخول مباشرة على رابط داخلي (Deep Link) في GitHub Pages
- السبب: GitHub Pages لا يدعم SPA routes على السيرفر.
- الحل في هذا المشروع:
  - [public/404.html](file:///workspace/public/404.html#L15-L24) يعيد كتابة المسار إلى `/?p=...`
  - [index.html](file:///workspace/index.html#L168-L177) و [App.tsx](file:///workspace/App.tsx#L73-L80) يعيدان `replaceState` للمسار الأصلي.
- إذا ظهرت المشكلة رغم ذلك:
  - تأكد أن `public/404.html` موجود ضمن `dist` بعد البناء.
  - تأكد أن النشر يرفع مجلد `dist` بالكامل (راجع [deploy-gh-pages.yml](file:///workspace/.github/workflows/deploy-gh-pages.yml#L31-L38)).

## تغييرات لا تظهر بسبب PWA/Cache
- السبب: Service Worker قد يقدم نسخة مخزنة.
- خطوات سريعة:
  - تحديث قسري للصفحة (Hard reload).
  - مسح بيانات الموقع (Site data) من المتصفح.
  - إلغاء تسجيل Service Worker ثم إعادة التحميل.
- ملاحظة: إعدادات PWA تستخدم `autoUpdate` في [vite.config.ts](file:///workspace/vite.config.ts#L20-L49)، لكن بعض المتصفحات قد تتأخر في تطبيق التحديثات.

## متغيرات البيئة (GA_MEASUREMENT_ID / GEMINI_API_KEY) لا تعمل
- تأكد من إنشاء `.env` من القالب [.env.example](file:///workspace/.env.example).
- تأكد أن أسماء المتغيرات مطابقة تماماً.
- `GEMINI_API_KEY` يتم حقنه في البناء عبر `define` داخل [vite.config.ts](file:///workspace/vite.config.ts#L51-L54).
- `GA_MEASUREMENT_ID`:
  - المكوّن [Analytics](file:///workspace/components/Analytics.tsx) موجود لكن غير مركّب حالياً في [App.tsx](file:///workspace/App.tsx).
  - يوجد placeholder معطّل (commented) في [index.html](file:///workspace/index.html#L87-L102).

## فشل `npm run build`
- تحقق من نسخة Node:
  - README يقترح Node 18+.
  - CI يستخدم Node 20 في [deploy-gh-pages.yml](file:///workspace/.github/workflows/deploy-gh-pages.yml#L22-L26).
- جرّب تنظيف التبعيات:
  - حذف `node_modules` و `package-lock.json` ثم `npm install` (إذا كنت تعمل محلياً).
  - أو استخدام `npm ci` عندما يكون `package-lock.json` مطابقاً.

## Tailwind أو الخطوط لا تظهر كما يجب
- تأكد أن [index.css](file:///workspace/index.css) يتم استيراده في [index.tsx](file:///workspace/index.tsx#L5).
- الخطوط (Cairo/Amiri) يتم تحميلها من Google Fonts في [index.html](file:///workspace/index.html#L121-L124).
- إذا كنت تعمل خلف شبكة تمنع Google Fonts، جرّب استضافة الخطوط محلياً.

## المفضلة لا تُحفظ أو تُمسح
- المفضلة تحفظ في `localStorage` بمفتاح `alhaytham-wishlist` في [WishlistContext](file:///workspace/context/WishlistContext.tsx#L25-L42).
- بعض أوضاع المتصفح (Private Mode) قد تمنع/تقيد `localStorage`.

## الروابط لواتساب لا تعمل
- تأكد أن رقم الهاتف مضبوط في [site.ts](file:///workspace/config/site.ts#L1-L15).
- تأكد أن `encodeURIComponent` يعمل على الرسالة (الموجود في [site.ts](file:///workspace/config/site.ts#L8-L15)).
- على iOS أحياناً فتح نافذة جديدة قد يُحجب؛ جرّب فتح الرابط بنفس التبويب.

