-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('PERCENT', 'FIXED');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "stockQty" INTEGER;

-- CreateTable
CREATE TABLE "product_relations" (
    "productId" TEXT NOT NULL,
    "relatedId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_relations_pkey" PRIMARY KEY ("productId","relatedId")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CouponType" NOT NULL DEFAULT 'PERCENT',
    "value" INTEGER NOT NULL,
    "minOrder" INTEGER NOT NULL DEFAULT 0,
    "maxDiscount" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "whatsappNumber" TEXT NOT NULL DEFAULT '963947931959',
    "phoneDisplay" TEXT NOT NULL DEFAULT '+963947931959',
    "email" TEXT,
    "workingHours" TEXT NOT NULL DEFAULT 'يومياً من 9 صباحاً حتى 9 مساءً',
    "shippingCost" INTEGER NOT NULL DEFAULT 25000,
    "freeShippingThreshold" INTEGER NOT NULL DEFAULT 500000,
    "heroBadge" TEXT NOT NULL DEFAULT 'إرث عائلي موثوق منذ 1997',
    "heroTitle" TEXT NOT NULL DEFAULT 'عسل طبيعي 100% من مراعي سوريا',
    "heroHighlight" TEXT NOT NULL DEFAULT 'الهيثم — نحل وعسل – منذ 1997',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'نقدّم عسلًا 100% طبيعي، مفحوصًا مخبريًا، من الخلية إلى مائدتك بلا أي إضافات.',
    "heroImage" TEXT,
    "announcementEnabled" BOOLEAN NOT NULL DEFAULT false,
    "announcementText" TEXT,
    "announcementLink" TEXT,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 3,
    "showRecentlyViewed" BOOLEAN NOT NULL DEFAULT true,
    "autoRelatedProducts" BOOLEAN NOT NULL DEFAULT true,
    "cartReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "cartReminderHours" INTEGER NOT NULL DEFAULT 12,
    "couponsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArticleToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArticleToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "product_relations_relatedId_idx" ON "product_relations"("relatedId");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "_ArticleToProduct_B_index" ON "_ArticleToProduct"("B");

-- AddForeignKey
ALTER TABLE "product_relations" ADD CONSTRAINT "product_relations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_relations" ADD CONSTRAINT "product_relations_relatedId_fkey" FOREIGN KEY ("relatedId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToProduct" ADD CONSTRAINT "_ArticleToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToProduct" ADD CONSTRAINT "_ArticleToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

