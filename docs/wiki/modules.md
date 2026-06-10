# الوحدات (Modules)

هذا المستودع منظّم بشكل “Feature-first” على مستوى الصفحات (Routes/Pages)، وتحتها مكوّنات قابلة لإعادة الاستخدام.

## الجذر (Root)
- [App.tsx](file:///workspace/App.tsx): تركيب الـ providers + الراوتر + طبقات الواجهة العامة.
- [index.tsx](file:///workspace/index.tsx): تركيب React + إخفاء/إظهار شاشة التحميل + مزوّد React Query.
- [index.html](file:///workspace/index.html): SEO/Structured Data + شاشة التحميل + حل deep-link للـ SPA.
- ملفات الإعدادات: [vite.config.ts](file:///workspace/vite.config.ts)، [tsconfig.json](file:///workspace/tsconfig.json)، [tailwind.config.js](file:///workspace/tailwind.config.js)، [vitest.config.ts](file:///workspace/vitest.config.ts)، [eslint.config.js](file:///workspace/eslint.config.js).

## pages/
مكوّنات الصفحات المرتبطة بالراوت، وظيفتها تركيب أقسام الصفحة وربطها بالبيانات، وليس بناء “UI primitives” قابلة لإعادة الاستخدام على نطاق واسع.
- المصدر: تعريف الراوتات في [App.tsx](file:///workspace/App.tsx#L99-L116)
- أمثلة:
  - تفاصيل المنتج: [ProductDetailsPage](file:///workspace/pages/ProductDetailsPage.tsx)
  - المقالات: [ArticlesPage](file:///workspace/pages/ArticlesPage.tsx)، [ArticleDetailPage](file:///workspace/pages/ArticleDetailPage.tsx)
  - التجارة: [CartPage](file:///workspace/pages/CartPage.tsx)، [WishlistPage](file:///workspace/pages/WishlistPage.tsx)

## components/
مكوّنات واجهة قابلة لإعادة الاستخدام وسلوكيات UX مشتركة. تقسيمها العام حسب المسؤولية:
- **غلاف التطبيق**: [Header](file:///workspace/components/Header.tsx)، [Footer](file:///workspace/components/Footer.tsx)، [ScrollToTop](file:///workspace/components/ScrollToTop.tsx)
- **Overlays**: [CartSidebar](file:///workspace/components/CartSidebar.tsx)، [WishlistSidebar](file:///workspace/components/WishlistSidebar.tsx)، [SearchBar](file:///workspace/components/SearchBar.tsx)
- **مساعدات SEO**: [Meta](file:///workspace/components/Meta.tsx)، [Breadcrumbs](file:///workspace/components/Breadcrumbs.tsx)
- **عرض المحتوى**: [MarkdownContent](file:///workspace/components/MarkdownContent.tsx)
- **عزل الأخطاء**: [ErrorBoundary](file:///workspace/components/ErrorBoundary.tsx)
- **أقسام صفحات**: مكوّنات مثل Hero/Story/Stats… داخل [components/](file:///workspace/components)
- **الخلطات المخصصة**: [SmartMixtureAssistant](file:///workspace/components/SmartMixtureAssistant.tsx)

## context/
حاويات حالة عامة مبنية بـ React Context + reducers.
- السلة: [CartContext](file:///workspace/context/CartContext.tsx)
- المفضلة: [WishlistContext](file:///workspace/context/WishlistContext.tsx)

## hooks/
واجهات استخدام مريحة حول الـ contexts.
- [useCart](file:///workspace/hooks/useCart.ts)
- [useWishlist](file:///workspace/hooks/useWishlist.ts)

## data/
مصادر بيانات ثابتة (تمثّل “قاعدة بيانات” مدمجة للمنتجات والمحتوى).
- المنتجات (مع تجميع وأنواع): [products.tsx](file:///workspace/data/products.tsx)
- سجل المقالات (يستورد markdown كنص خام): [articles.ts](file:///workspace/data/articles.ts)

## content/
ملفات Markdown لمقالات SEO.
- المصدر: [content/articles](file:///workspace/content/articles)
- يتم استيرادها عبر Vite `?raw` في [articles.ts](file:///workspace/data/articles.ts#L2-L10)

## config/
ثوابت الموقع ودوال المساعدة.
- بناء روابط واتساب/هاتف: [site.ts](file:///workspace/config/site.ts)

## scripts/
سكريبتات وأدوات البناء.
- تنظيف dist قبل البناء: [clean-dist.mjs](file:///workspace/scripts/clean-dist.mjs)
- مولّد sitemap (تشغيل يدوي): [generate-sitemap.ts](file:///workspace/scripts/generate-sitemap.ts)

## tests/
تهيئة الاختبارات واختبارات المكوّنات.
- إعداد Vitest + Testing Library: [setup.ts](file:///workspace/tests/setup.ts)
- مثال اختبار: [ErrorBoundary.test.tsx](file:///workspace/components/ErrorBoundary.test.tsx)
