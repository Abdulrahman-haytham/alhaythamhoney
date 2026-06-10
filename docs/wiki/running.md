# Running Locally

## Prerequisites
- Node.js 18+
- npm 9+

## Install

```bash
npm install
cp .env.example .env
```

## Environment Variables
- Template: [.env.example](file:///workspace/.env.example)
- `GA_MEASUREMENT_ID` (optional): used by [Analytics](file:///workspace/components/Analytics.tsx)
- `GEMINI_API_KEY` (optional): injected by Vite define in [vite.config.ts](file:///workspace/vite.config.ts#L51-L54)

## Development

```bash
npm run dev
```

- Default dev URL: `http://localhost:3003` (configured in [vite.config.ts](file:///workspace/vite.config.ts#L12-L15)).

## Test

```bash
npm run test
```

CI-friendly, non-watch run:

```bash
npm run test:run
```

Coverage:

```bash
npm run test:coverage
```

## Lint / Format

```bash
npm run lint
npm run format
npm run format:check
```

## Build & Preview

```bash
npm run build
npm run preview
```

## Deploy (GitHub Pages)

```bash
npm run deploy
```

For automated deploys, see [deploy-gh-pages.yml](file:///workspace/.github/workflows/deploy-gh-pages.yml).

