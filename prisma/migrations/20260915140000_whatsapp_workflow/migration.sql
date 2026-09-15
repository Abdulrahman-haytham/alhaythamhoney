-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "followUpAt" TIMESTAMP(3),
ADD COLUMN     "pointsDiscount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "quoteSnapshot" JSONB,
ADD COLUMN     "requestHash" TEXT;

-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "rewardOrderId" TEXT;

-- AlterTable
ALTER TABLE "coupon_redemptions" ADD COLUMN     "orderId" TEXT;

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "cartJson" JSONB,
ADD COLUMN     "cartRemindedAt" TIMESTAMP(3),
ADD COLUMN     "cartUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "referralRewardedAt" TIMESTAMP(3),
ADD COLUMN     "unsubscribeToken" TEXT,
ALTER COLUMN "marketingOptIn" SET DEFAULT false;

-- AlterTable
ALTER TABLE "points_transactions" ADD COLUMN     "eventKey" TEXT;

-- AlterTable
ALTER TABLE "site_settings" ALTER COLUMN "lowStockThreshold" SET DEFAULT 0,
ALTER COLUMN "stockAlertsEnabled" SET DEFAULT false,
ALTER COLUMN "productFeedEnabled" SET DEFAULT false;

-- AlterTable
ALTER TABLE "campaign_recipients" ADD COLUMN     "claimedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "orders_status_followUpAt_idx" ON "orders"("status", "followUpAt");

-- CreateIndex
CREATE INDEX "coupon_redemptions_orderId_idx" ON "coupon_redemptions"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_unsubscribeToken_key" ON "customers"("unsubscribeToken");

-- CreateIndex
CREATE UNIQUE INDEX "points_transactions_eventKey_key" ON "points_transactions"("eventKey");

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_rewardOrderId_fkey" FOREIGN KEY ("rewardOrderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Preserve historical redemption cost at the value shown on each saved order, rather
-- than revaluing old redemptions when the administrator changes the point value.
UPDATE orders AS o
SET "pointsDiscount" = COALESCE((
  SELECT SUM((a->>'amount')::integer)
  FROM jsonb_array_elements(CASE
    WHEN jsonb_typeof(o.breakdown->'adjustments') = 'array' THEN o.breakdown->'adjustments'
    ELSE '[]'::jsonb END) AS a
  WHERE a->>'kind' = 'points' AND (a->>'amount') ~ '^[0-9]+$'
), 0)
WHERE o."pointsUsed" > 0;
