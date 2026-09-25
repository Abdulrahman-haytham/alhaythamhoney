-- خلطة بوصفة ثابتة: المالك يقفل المقادير ويسعّر المرطبان بنفسه
ALTER TABLE "mixtures" ADD COLUMN "customizable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "mixtures" ADD COLUMN "fixedPrice" INTEGER;
