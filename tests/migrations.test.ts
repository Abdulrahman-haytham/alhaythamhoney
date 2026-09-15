import { it, expect } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFile, readdir } from 'node:fs/promises';
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
    const names = (
      await readdir(path.join(process.cwd(), 'prisma/migrations'), { withFileTypes: true })
    )
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
    for (const name of names.slice(1)) {
      if (name === '20260915140000_whatsapp_workflow')
        await pg.exec(
          `INSERT INTO orders (id, reference, subtotal, total, "pointsUsed", breakdown, "updatedAt") VALUES ('old-order', 'HY-OLD234', 100000, 80000, 40, '{"adjustments":[{"kind":"points","amount":20000}]}', NOW())`,
        );
      await pg.exec(await sql(name));
    }
    expect(
      (await pg.query(`SELECT "pointsDiscount" FROM orders WHERE id = 'old-order'`)).rows,
    ).toEqual([{ pointsDiscount: 20000 }]);
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
    const columns = await pg.query<{ column_name: string }>(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'customers'",
    );
    expect(columns.rows.map((c) => c.column_name)).toEqual(
      expect.arrayContaining(['cartJson', 'cartUpdatedAt', 'cartRemindedAt', 'unsubscribeToken']),
    );
    expect((await pg.query('SELECT id FROM products')).rows).toEqual([{ id: 'preserve-me' }]);
  } finally {
    await pg.close();
  }
}, 30000);
