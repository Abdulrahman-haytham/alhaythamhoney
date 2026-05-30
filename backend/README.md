# 🍯 الهيثم نحل و عسل — Backend API

NestJS + PostgreSQL backend for the Al-Haytham Honey storefront.

This is **Sprint 1** (foundation): public read endpoints for products and
articles, plus a seed script that migrates the legacy static data into the
database. Auth, orders, mixtures, uploads and the admin panel come in later
sprints.

## Stack

- **NestJS 10** + **TypeORM 0.3**
- **PostgreSQL 16**

## Quick start

```bash
cd backend
cp .env.example .env          # adjust DB_PASSWORD etc.

# 1. Start PostgreSQL
docker compose up -d

# 2. Install dependencies
npm install

# 3. Create tables (DB_SYNCHRONIZE=true in .env) + seed data
npm run start:dev             # starts API on :3001, auto-creates tables
# in another terminal:
npm run seed                  # migrates products + articles into the DB
```

The API is served under the `/api` prefix on `http://localhost:3001`.

## Endpoints (Sprint 1)

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/product-groups` | Groups with nested active products |
| `GET` | `/api/products` | Flat list of active products |
| `GET` | `/api/products/:slug` | Single product by slug |
| `GET` | `/api/articles` | Published article metadata |
| `GET` | `/api/articles/:slug` | Full article with HTML content |

## Environment variables

See `.env.example`. Key ones:

- `DB_*` — PostgreSQL connection
- `DB_SYNCHRONIZE` — `true` auto-creates/updates tables (dev only; use
  migrations in production)
- `FRONTEND_URLS` — comma-separated CORS allowlist
- `PORT` — API port (default `3001`)

## Data migration

`npm run seed` reads:

- Product/group data embedded in `src/database/seeds/seed.ts`
- Article markdown bodies from `../content/articles/*.md` (the existing
  frontend content directory)

It upserts by `slug`, so it is safe to re-run.

## Notes

- Product `price` is intentionally `null` — pricing is negotiated over
  WhatsApp today. The column is ready for when prices are set.
- The two Unsplash product images should be re-hosted on Cloudinary before
  production (Unsplash hotlinking is discouraged).
