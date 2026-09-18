-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "brandAliases" TEXT[] DEFAULT ARRAY['Al-Haytham Honey']::TEXT[],
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT;

