-- CreateEnum
CREATE TYPE "PointsReason" AS ENUM ('ORDER_EARN', 'ORDER_REDEEM', 'ORDER_REFUND', 'REFERRAL', 'ADMIN');

-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredById" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "pointsEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsUsed" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "loyaltyEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "loyaltyMonthlyBudget" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxRedeemPercent" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "minRedeemPoints" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "pointValue" INTEGER NOT NULL DEFAULT 500,
ADD COLUMN     "pointsPerSyp" INTEGER NOT NULL DEFAULT 10000,
ADD COLUMN     "referralCouponDays" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "referralEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referralMaxDiscount" INTEGER NOT NULL DEFAULT 50000,
ADD COLUMN     "referralMonthlyCap" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referralPercent" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "welcomeCouponDays" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "welcomeCouponEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "welcomeMaxDiscount" INTEGER NOT NULL DEFAULT 50000,
ADD COLUMN     "welcomeMinOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "welcomeMonthlyCap" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "welcomePercent" INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "points_transactions" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" "PointsReason" NOT NULL,
    "orderId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "points_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "points_transactions_customerId_createdAt_idx" ON "points_transactions"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "points_transactions_reason_createdAt_idx" ON "points_transactions"("reason", "createdAt");

-- CreateIndex
CREATE INDEX "coupons_customerId_idx" ON "coupons"("customerId");

-- CreateIndex
CREATE INDEX "coupons_source_createdAt_idx" ON "coupons"("source", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "customers_referralCode_key" ON "customers"("referralCode");

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_transactions" ADD CONSTRAINT "points_transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

