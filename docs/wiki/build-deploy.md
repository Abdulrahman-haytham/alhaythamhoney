# Build & Deploy

## Toolchain
- Vite + React plugin: [vite.config.ts](file:///workspace/vite.config.ts)
- TypeScript: [tsconfig.json](file:///workspace/tsconfig.json)
- Tailwind + PostCSS: [tailwind.config.js](file:///workspace/tailwind.config.js), [postcss.config.js](file:///workspace/postcss.config.js)
- Testing: Vitest + Testing Library ([vitest.config.ts](file:///workspace/vitest.config.ts))
- Lint/format: ESLint + Prettier ([eslint.config.js](file:///workspace/eslint.config.js), [.prettierrc.json](file:///workspace/.prettierrc.json))

## Vite Configuration Notes

### Dev server
- Port and host are set explicitly in [vite.config.ts](file:///workspace/vite.config.ts#L12-L15) (useful for container/remote dev).

### PWA
- PWA support is enabled with `vite-plugin-pwa` in [vite.config.ts](file:///workspace/vite.config.ts#L20-L49).
- `registerType: autoUpdate` and Workbox settings ensure updated caches are applied quickly.

### Environment injection
- `GEMINI_API_KEY` is loaded from `.env` using `loadEnv` and defined into the build as:
  - `process.env.API_KEY`
  - `process.env.GEMINI_API_KEY`
  via [vite.config.ts](file:///workspace/vite.config.ts#L51-L54).

### Manual chunking
- Rollup manual chunks split core frameworks and UI libs for caching benefits:
  - `react-vendor`
  - `ui-vendor`
  in [vite.config.ts](file:///workspace/vite.config.ts#L60-L68).

## Build Scripts

Source: [package.json](file:///workspace/package.json#L7-L20)
- `npm run dev`: starts Vite dev server
- `npm run build`: production build (runs `prebuild` first)
- `npm run preview`: preview built app
- `npm run test` / `test:run` / `test:coverage`: Vitest
- `npm run lint`: ESLint
- `npm run format`: Prettier
- `npm run deploy`: publishes `dist` using `gh-pages`

### prebuild cleanup
- `prebuild` removes the old `dist` folder via [clean-dist.mjs](file:///workspace/scripts/clean-dist.mjs).

## CI/CD (GitHub Pages)
- Workflow: [deploy-gh-pages.yml](file:///workspace/.github/workflows/deploy-gh-pages.yml)
- Trigger: pushes to `main` (and manual workflow dispatch).
- Steps: `npm ci` → `npm run build` → publish `./dist` to GitHub Pages.
- Custom domain is set via `cname: alhaythamhoney.sy`.

