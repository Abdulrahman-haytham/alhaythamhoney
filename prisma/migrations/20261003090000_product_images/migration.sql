-- صور إضافية لمعرض المنتج (الرئيسية تبقى في "image")
ALTER TABLE "products" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
