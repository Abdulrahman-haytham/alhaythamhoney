-- Add only missing feature tables; preserve existing product/order/review data.
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

CREATE TABLE "mixtures" (
  "id" TEXT NOT NULL, "slug" TEXT NOT NULL, "name" TEXT NOT NULL,
  "tagline" TEXT NOT NULL, "desc" TEXT NOT NULL, "image" TEXT,
  "baseSize" INTEGER NOT NULL DEFAULT 500, "prepFee" INTEGER NOT NULL DEFAULT 0,
  "published" BOOLEAN NOT NULL DEFAULT true, "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "mixtures_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "mixtures_slug_key" ON "mixtures"("slug");
CREATE INDEX "mixtures_published_sortOrder_idx" ON "mixtures"("published", "sortOrder");

CREATE TABLE "mixture_ingredients" (
  "id" TEXT NOT NULL, "mixtureId" TEXT NOT NULL, "name" TEXT NOT NULL, "note" TEXT,
  "pricePerGram" INTEGER NOT NULL, "minGrams" INTEGER NOT NULL,
  "maxGrams" INTEGER NOT NULL, "recommended" INTEGER NOT NULL,
  "step" INTEGER NOT NULL DEFAULT 5, "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "mixture_ingredients_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "mixture_ingredients_mixtureId_idx" ON "mixture_ingredients"("mixtureId");
ALTER TABLE "mixture_ingredients" ADD CONSTRAINT "mixture_ingredients_mixtureId_fkey"
  FOREIGN KEY ("mixtureId") REFERENCES "mixtures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "studio_photos" (
  "id" TEXT NOT NULL, "url" TEXT NOT NULL, "caption" TEXT,
  "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "studio_photos_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "studio_photos_createdAt_idx" ON "studio_photos"("createdAt");
