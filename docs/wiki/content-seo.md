# المحتوى و SEO

التطبيق مصمم لصفحات تسويقية ومحتوى SEO (صفحات ثابتة + مقالات Markdown)، ويوفر أدوات SEO عامة وعلى مستوى كل راوت.

## المقالات (Markdown)

### مصدر الحقيقة
- ملفات Markdown موجودة في [content/articles](file:///workspace/content/articles).
- سجل المقالات في [articles.ts](file:///workspace/data/articles.ts) يستورد الملفات كنص خام عبر Vite `?raw` (مثل [articles.ts](file:///workspace/data/articles.ts#L2-L10)).

### مسار العرض (Rendering)
- الصفحات تأخذ `Article.content` من السجل وتعرضه بواسطة [MarkdownContent](file:///workspace/components/MarkdownContent.tsx).
- التحويل من Markdown إلى HTML يتم على المتصفح باستخدام Unified/Remark:
  - parse: `remark-parse`
  - transform: `remark-html`
  - sanitize: `rehype-sanitize`
  - التنفيذ: [MarkdownContent](file:///workspace/components/MarkdownContent.tsx#L15-L42)

## المنتجات (كتالوج ثابت)
- الكتالوج مُعرّف كبيانات ثابتة ومجمّعة في [products.tsx](file:///workspace/data/products.tsx).
- صفحة تفاصيل المنتج تبحث عن المنتج بواسطة slug (`/product/:slug`) عبر flatten لكل المجموعات في [ProductDetailsPage](file:///workspace/pages/ProductDetailsPage.tsx#L14-L18).

## وسوم Meta (لكل راوت)
- المكوّن [Meta](file:///workspace/components/Meta.tsx) يقوم بضبط:
  - `<title>` و `meta[name=description]`
  - canonical حسب المسار الحالي عبر `useLocation` ([Meta](file:///workspace/components/Meta.tsx#L33-L48))
  - وسوم Open Graph و Twitter ([Meta](file:///workspace/components/Meta.tsx#L49-L61))

## Structured Data (Schema.org)
- ملف [index.html](file:///workspace/index.html) يتضمن Structured Data للموقع (Organization/LocalBusiness) بصيغة JSON-LD.
- صفحة المنتج تضيف schema خاص بالمنتج عبر children داخل `Meta` في [ProductDetailsPage](file:///workspace/pages/ProductDetailsPage.tsx#L41-L83).

## Sitemap
- يوجد ملف ثابت [public/sitemap.xml](file:///workspace/public/sitemap.xml) للاستخدام الإنتاجي.
- يوجد مولّد ديناميكي في [generate-sitemap.ts](file:///workspace/scripts/generate-sitemap.ts) يستخرج الروابط من:
  - قائمة الصفحات الثابتة
  - [articles](file:///workspace/data/articles.ts)
  - [groups](file:///workspace/data/products.tsx)

## Analytics
- يمكن تحميل GA4 عبر [Analytics](file:///workspace/components/Analytics.tsx)، لكنه غير مركّب حالياً ضمن [App.tsx](file:///workspace/App.tsx).
- [index.html](file:///workspace/index.html#L87-L102) يحتوي بلوك placeholder معطّل (commented) لإضافة GA.
