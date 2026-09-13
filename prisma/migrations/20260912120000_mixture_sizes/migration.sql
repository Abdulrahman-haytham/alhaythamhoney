-- الجرعات صارت مطلقة لا تتبع الحجم: baseSize لم يعد مرجعاً للتوسيع بل الحجم الافتراضي المختار.
-- إعادة تسمية بدل حذف/إضافة حفاظاً على القيم الموجودة.
ALTER TABLE "mixtures" RENAME COLUMN "baseSize" TO "defaultSize";

ALTER TABLE "mixtures"
  ADD COLUMN "sizes" INTEGER[] NOT NULL DEFAULT ARRAY[250, 500, 1000]::INTEGER[];
