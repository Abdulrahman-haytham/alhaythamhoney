# ويكي الكود

هذا المستودع عبارة عن تطبيق React + TypeScript بنمط SPA لموقع “الهيثم نحل و عسل”. يتم بناؤه بواسطة Vite، وتنسيقه باستخدام Tailwind CSS، ونشره على GitHub Pages.

**روابط سريعة**
- نقاط الدخول: [index.html](file:///workspace/index.html)، [index.tsx](file:///workspace/index.tsx)، [App.tsx](file:///workspace/App.tsx)
- صفحات الراوت: [pages/](file:///workspace/pages)
- مكوّنات مشتركة: [components/](file:///workspace/components)
- الحالة (State): [CartContext](file:///workspace/context/CartContext.tsx)، [WishlistContext](file:///workspace/context/WishlistContext.tsx)
- بيانات ثابتة ومحتوى: [products.tsx](file:///workspace/data/products.tsx)، [articles.ts](file:///workspace/data/articles.ts)، [content/articles](file:///workspace/content/articles)

## محتويات الويكي
- [المعمارية](./architecture.md)
- [الوحدات/المجلدات](./modules.md)
- [إدارة الحالة](./state-management.md)
- [المحتوى و SEO](./content-seo.md)
- [البناء والنشر](./build-deploy.md)
- [مرجع الدوال/الكلاسات المهمة](./api-reference.md)
- [تشغيل المشروع محلياً](./running.md)
- [تدفق البيانات حسب الميزة](./data-flow-by-feature.md)
- [حل المشاكل الشائعة](./troubleshooting.md)

## تدفق بيانات عالي المستوى

```mermaid
flowchart TD
  A[index.html] --> B[index.tsx]
  B --> C[App.tsx]
  C --> D[React Router routes]
  D --> E[Pages]
  E --> F[Components]
  E --> G[data/products.tsx]
  E --> H[data/articles.ts -> markdown ?raw]
  F --> I[CartContext / WishlistContext]
  F --> J[config/site.ts (WhatsApp/tel links)]
  E --> K[Meta (SEO)]
```
