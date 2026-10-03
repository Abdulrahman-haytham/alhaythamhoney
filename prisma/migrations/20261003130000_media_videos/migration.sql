-- فيديو للمنتج، وصور إضافية وفيديو للخلطة
ALTER TABLE "products" ADD COLUMN     "videos" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "mixtures" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "videos" TEXT[] DEFAULT ARRAY[]::TEXT[];
