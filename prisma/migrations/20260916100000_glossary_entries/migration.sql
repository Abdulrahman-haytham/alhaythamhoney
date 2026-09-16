-- CreateTable
CREATE TABLE "glossary_entries" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "tip" TEXT,
    "image" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "glossary_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GlossaryEntryToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GlossaryEntryToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "glossary_entries_slug_key" ON "glossary_entries"("slug");

-- CreateIndex
CREATE INDEX "glossary_entries_published_sortOrder_idx" ON "glossary_entries"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "glossary_entries_category_idx" ON "glossary_entries"("category");

-- CreateIndex
CREATE INDEX "_GlossaryEntryToProduct_B_index" ON "_GlossaryEntryToProduct"("B");

-- AddForeignKey
ALTER TABLE "_GlossaryEntryToProduct" ADD CONSTRAINT "_GlossaryEntryToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "glossary_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GlossaryEntryToProduct" ADD CONSTRAINT "_GlossaryEntryToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

