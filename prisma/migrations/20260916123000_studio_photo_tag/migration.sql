-- AlterTable
ALTER TABLE "studio_photos" ADD COLUMN     "tag" TEXT;

-- CreateIndex
CREATE INDEX "studio_photos_tag_idx" ON "studio_photos"("tag");

