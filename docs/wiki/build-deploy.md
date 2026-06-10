# البناء والنشر (Build & Deploy)

## سلسلة الأدوات (Toolchain)
- Vite + React plugin: [vite.config.ts](file:///workspace/vite.config.ts)
- TypeScript: [tsconfig.json](file:///workspace/tsconfig.json)
- Tailwind + PostCSS: [tailwind.config.js](file:///workspace/tailwind.config.js), [postcss.config.js](file:///workspace/postcss.config.js)
- Testing: Vitest + Testing Library ([vitest.config.ts](file:///workspace/vitest.config.ts))
- Lint/format: ESLint + Prettier ([eslint.config.js](file:///workspace/eslint.config.js), [.prettierrc.json](file:///workspace/.prettierrc.json))

## ملاحظات إعدادات Vite

### خادم التطوير (Dev server)
- المنفذ والـ host مضبوطين بشكل صريح في [vite.config.ts](file:///workspace/vite.config.ts#L12-L15) (مفيد للتطوير ضمن حاويات/بيئات بعيدة).

### PWA
- دعم PWA مفعّل عبر `vite-plugin-pwa` في [vite.config.ts](file:///workspace/vite.config.ts#L20-L49).
- `registerType: autoUpdate` وإعدادات Workbox تساعد على تطبيق التحديثات بسرعة.

### تمرير متغيرات البيئة إلى البناء
- يتم تحميل `GEMINI_API_KEY` من `.env` عبر `loadEnv` ثم حقنه ضمن البناء كالتالي:
  - `process.env.API_KEY`
  - `process.env.GEMINI_API_KEY`
  في [vite.config.ts](file:///workspace/vite.config.ts#L51-L54).

### تقسيم الحِزم (Manual chunking)
- يتم تقسيم الحزم لتحسين الكاش:
  - `react-vendor`
  - `ui-vendor`
  في [vite.config.ts](file:///workspace/vite.config.ts#L60-L68).

## سكربتات البناء

Source: [package.json](file:///workspace/package.json#L7-L20)
- `npm run dev`: starts Vite dev server
- `npm run build`: production build (runs `prebuild` first)
- `npm run preview`: preview built app
- `npm run test` / `test:run` / `test:coverage`: Vitest
- `npm run lint`: ESLint
- `npm run format`: Prettier
- `npm run deploy`: publishes `dist` using `gh-pages`

### تنظيف prebuild
- سكربت `prebuild` يحذف مجلد `dist` قبل البناء عبر [clean-dist.mjs](file:///workspace/scripts/clean-dist.mjs).

## CI/CD (GitHub Pages)
- Workflow: [deploy-gh-pages.yml](file:///workspace/.github/workflows/deploy-gh-pages.yml)
- Trigger: pushes to `main` (and manual workflow dispatch).
- Steps: `npm ci` → `npm run build` → publish `./dist` to GitHub Pages.
- Custom domain is set via `cname: alhaythamhoney.sy`.
