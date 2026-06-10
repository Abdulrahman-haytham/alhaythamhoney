# تشغيل المشروع محلياً

## المتطلبات
- Node.js 18+
- npm 9+

## التثبيت

```bash
npm install
cp .env.example .env
```

## متغيرات البيئة
- القالب: [.env.example](file:///workspace/.env.example)
- `GA_MEASUREMENT_ID` (اختياري): يستخدمه [Analytics](file:///workspace/components/Analytics.tsx)
- `GEMINI_API_KEY` (اختياري): يتم حقنه ضمن البناء عبر Vite define في [vite.config.ts](file:///workspace/vite.config.ts#L51-L54)

## التطوير

```bash
npm run dev
```

- رابط التطوير الافتراضي: `http://localhost:3003` (مضبوط في [vite.config.ts](file:///workspace/vite.config.ts#L12-L15)).

## الاختبارات

```bash
npm run test
```

تشغيل مناسب للـ CI (بدون watch):

```bash
npm run test:run
```

تغطية الاختبارات (Coverage):

```bash
npm run test:coverage
```

## Lint / Format

```bash
npm run lint
npm run format
npm run format:check
```

## البناء والمعاينة

```bash
npm run build
npm run preview
```

## النشر (GitHub Pages)

```bash
npm run deploy
```

للنشر الآلي راجع [deploy-gh-pages.yml](file:///workspace/.github/workflows/deploy-gh-pages.yml).
