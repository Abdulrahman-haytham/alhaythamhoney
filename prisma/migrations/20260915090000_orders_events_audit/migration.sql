-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('PRODUCT_VIEW', 'ADD_TO_CART', 'WHATSAPP_CLICK', 'CHECKOUT', 'SEARCH');

-- DropIndex
DROP INDEX "orders_customerPhone_idx";

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "cartId" TEXT,
ADD COLUMN     "recipe" TEXT;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "customerAddress",
DROP COLUMN "discountAmount",
DROP COLUMN "paymentMethod",
DROP COLUMN "totalAmount",
ADD COLUMN     "breakdown" JSONB,
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "discount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shipping" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subtotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "customerName" DROP NOT NULL,
ALTER COLUMN "customerPhone" DROP NOT NULL,
ALTER COLUMN "customerCity" DROP NOT NULL;
-- الأعمدة الجديدة بلا قيمة افتراضية في المخطط؛ الافتراضي أعلاه لصفوف قديمة فقط
ALTER TABLE "orders" ALTER COLUMN "subtotal" DROP DEFAULT, ALTER COLUMN "total" DROP DEFAULT;

-- CreateTable
CREATE TABLE "article_revisions" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "key" TEXT,
    "value" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "label" TEXT,
    "changes" JSONB,
    "actor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "article_revisions_articleId_createdAt_idx" ON "article_revisions"("articleId", "createdAt");

-- CreateIndex
CREATE INDEX "events_type_createdAt_idx" ON "events"("type", "createdAt");

-- CreateIndex
CREATE INDEX "events_createdAt_idx" ON "events"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "orders_customerId_createdAt_idx" ON "orders"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_revisions" ADD CONSTRAINT "article_revisions_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

