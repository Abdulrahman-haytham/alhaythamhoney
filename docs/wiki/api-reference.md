# مرجع الدوال/الكلاسات المهمة (Key Code)

هذا ليس مرجع API شامل (لأن التطبيق يعتمد كثيراً على تركيب المكوّنات)، لكنه يوثق أهم الدوال/الكلاسات التي تحمل منطقاً فعلياً ومسارات البيانات.

## الإقلاع (Bootstrap)

### تسلسل إخفاء شاشة التحميل
- الملف: [index.tsx](file:///workspace/index.tsx#L13-L36)
- الهدف: إبقاء شاشة التحميل حتى اكتمال `window.load` ثم:
  - إضافة `ready` إلى `#root`
  - تلاشي وحذف `#splash-loader`

## التوجيه (Routing)

### تعريف الراوتات
- الملف: [App.tsx](file:///workspace/App.tsx#L15-L50) (تحميل كسول للصفحات)، [App.tsx](file:///workspace/App.tsx#L99-L116) (جدول الراوتات)

### حل إعادة التوجيه على GitHub Pages
- الملف: [App.tsx](file:///workspace/App.tsx#L73-L80)
- يقرأ `?p=` ثم يستدعي `history.replaceState` لاستعادة مسار الـ SPA الأصلي.

## دوال مساعدة للموقع

### getWhatsAppLink
- File: [site.ts](file:///workspace/config/site.ts#L8-L15)
- التوقيع: `getWhatsAppLink(message?: string) => string`
- السلوك:
  - إذا كانت الرسالة غير فارغة يتم ترميزها داخل `https://wa.me/<digits>?text=<encoded>`
  - وإلا يرجع `https://wa.me/<digits>`

## حالة السلة

### cartReducer
- File: [CartContext](file:///workspace/context/CartContext.tsx#L31-L75)
- الأفعال (Actions):
  - `ADD_ITEM`: increments quantity if existing, else adds item with `quantity: 1`
  - `REMOVE_ITEM`
  - `UPDATE_QUANTITY`: clamps at `>= 0` and removes any items that drop to 0
  - `CLEAR_CART`
  - `OPEN_CART` / `CLOSE_CART` / `TOGGLE_CART`

### قيمة مشتقة: totalItems
- File: [CartContext](file:///workspace/context/CartContext.tsx#L121-L126)
- تُحسب كمجموع كميات كل العناصر.

## حالة المفضلة

### wishlistReducer
- File: [WishlistContext](file:///workspace/context/WishlistContext.tsx#L49-L75)
- الأفعال (Actions):
  - `ADD_ITEM`: adds new item with `addedAt: Date.now()` (no duplicates)
  - `REMOVE_ITEM`
  - `OPEN_WISHLIST` / `CLOSE_WISHLIST` / `TOGGLE_WISHLIST`
  - `LOAD_FROM_STORAGE` (defined but not used by the current provider)

### دوال التخزين
- File: [WishlistContext](file:///workspace/context/WishlistContext.tsx#L27-L42)
- `getStoredWishlist()` و `saveToStorage()` تغلف الوصول لـ `localStorage` مع try/catch.

## عرض Markdown

### MarkdownContent
- File: [MarkdownContent](file:///workspace/components/MarkdownContent.tsx#L12-L49)
- السلوك:
  - تحويل Markdown إلى HTML مُنقّى (sanitized) بشكل غير متزامن داخل `useEffect`
  - وضع HTML عبر `dangerouslySetInnerHTML`

## SEO

### Meta
- File: [Meta](file:///workspace/components/Meta.tsx#L23-L64)
- المسؤوليات:
  - حساب canonical URL حسب المسار الحالي
  - ضبط Open Graph + Twitter وإمكانية `noindex`

## الخلطات المخصصة

### getRecommendation
- File: [SmartMixtureAssistant](file:///workspace/components/SmartMixtureAssistant.tsx#L52-L106)
- السلوك: محرك توصية قواعدي يعتمد على:
  - allergy response (dominant override)
  - goal (fertility/energy/immunity/general)
  - age (special-case for child immunity)

## توليد Sitemap

### generateSitemap
- File: [generate-sitemap.ts](file:///workspace/scripts/generate-sitemap.ts#L36-L70)
- السلوك:
  - Creates entries for static routes
  - Adds `/articles/<id>` from [articles](file:///workspace/data/articles.ts)
  - Adds `/product/<id>` from [groups](file:///workspace/data/products.tsx)
