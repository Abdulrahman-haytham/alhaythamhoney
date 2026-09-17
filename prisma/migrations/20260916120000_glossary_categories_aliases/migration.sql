-- AlterTable
ALTER TABLE "glossary_entries" ADD COLUMN     "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "sources" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "glossary_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "intro" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "glossary_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "glossary_categories_name_key" ON "glossary_categories"("name");

-- CreateIndex
CREATE INDEX "glossary_categories_sortOrder_idx" ON "glossary_categories"("sortOrder");

