-- AlterTable
ALTER TABLE "campaign_recipients" ADD COLUMN     "claimedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "coupon_redemptions" ADD COLUMN     "orderId" TEXT;

-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "rewardOrderId" TEXT;

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "referralRewardedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "followUpAt" TIMESTAMP(3),
ADD COLUMN     "pointsDiscount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "quoteSnapshot" JSONB,
ADD COLUMN     "requestHash" TEXT;

-- AlterTable
ALTER TABLE "points_transactions" ADD COLUMN     "eventKey" TEXT;

-- CreateIndex
CREATE INDEX "coupon_redemptions_orderId_idx" ON "coupon_redemptions"("orderId");

-- CreateIndex
CREATE INDEX "orders_status_followUpAt_idx" ON "orders"("status", "followUpAt");

-- CreateIndex
CREATE UNIQUE INDEX "points_transactions_eventKey_key" ON "points_transactions"("eventKey");

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_rewardOrderId_fkey" FOREIGN KEY ("rewardOrderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- تعبئة خصم النقاط للطلبات القديمة من تفصيل الحساب المحفوظ،
-- حتى تُحسب ميزانية الولاء الشهرية على الشهر الجاري بلا نقص.
UPDATE "orders" o
SET "pointsDiscount" = COALESCE((
  SELECT SUM((a->>'amount')::integer)
  FROM jsonb_array_elements(CASE
    WHEN jsonb_typeof(o.breakdown->'adjustments') = 'array' THEN o.breakdown->'adjustments'
    ELSE '[]'::jsonb END) AS a
  WHERE a->>'kind' = 'points' AND (a->>'amount') ~ '^[0-9]+$'
), 0)
WHERE o."pointsUsed" > 0;
