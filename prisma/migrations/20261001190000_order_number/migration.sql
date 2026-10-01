-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "number" INTEGER;

-- Backfill: each existing order gets a distinct random five-digit number.
WITH pool AS (
    SELECT n, row_number() OVER () AS rn
    FROM (SELECT n FROM generate_series(10000, 99999) AS n ORDER BY random() LIMIT (SELECT count(*) FROM "orders")) p
), existing AS (
    SELECT id, row_number() OVER (ORDER BY "createdAt") AS rn FROM "orders"
)
UPDATE "orders" o SET "number" = pool.n
FROM existing JOIN pool ON pool.rn = existing.rn
WHERE o.id = existing.id;

-- CreateIndex
CREATE UNIQUE INDEX "orders_number_key" ON "orders"("number");
