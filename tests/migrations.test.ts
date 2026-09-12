import { it, expect } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

it('applies all migrations to an empty PostgreSQL engine without dropping existing data', async () => {
  const pg = new PGlite();
  const sql = (name: string) =>
    readFile(path.join(process.cwd(), 'prisma/migrations', name, 'migration.sql'), 'utf8');
  try {
    await pg.exec(await sql('20260910065817_init'));
    await pg.exec(
      `INSERT INTO products (id, slug, name, "desc", image, "updatedAt") VALUES ('preserve-me', 'old-honey', 'old product', 'old desc', '/old.png', NOW())`,
    );
    await pg.exec(await sql('20260912080000_mixtures_studio'));
    await pg.exec(await sql('20260912081000_rate_limits'));
    const { rows } = await pg.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public'",
    );
    expect(rows.map((r) => r.tablename)).toEqual(
      expect.arrayContaining([
        'admins',
        'products',
        'orders',
        'order_items',
        'reviews',
        'mixtures',
        'mixture_ingredients',
        'studio_photos',
        'rate_limits',
      ]),
    );
    expect((await pg.query('SELECT id FROM products')).rows).toEqual([{ id: 'preserve-me' }]);
  } finally {
    await pg.close();
  }
}, 30000);
