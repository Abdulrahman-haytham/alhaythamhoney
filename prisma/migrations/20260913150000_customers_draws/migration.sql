-- CreateEnum
CREATE TYPE "DrawStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'DRAWN');

-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "oncePerCustomer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requiresLogin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "customerId" TEXT;

-- CreateTable
CREATE TABLE "coupon_redemptions" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT,
    "marketingOptIn" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_codes" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draws" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prize" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "DrawStatus" NOT NULL DEFAULT 'DRAFT',
    "maxEntries" INTEGER NOT NULL DEFAULT 0,
    "winnerEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draws_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draw_entries" (
    "id" TEXT NOT NULL,
    "drawId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "jarCodeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "draw_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jar_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "batch" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "usedById" TEXT,

    CONSTRAINT "jar_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coupon_redemptions_couponId_customerId_idx" ON "coupon_redemptions"("couponId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_phone_idx" ON "customers"("phone");

-- CreateIndex
CREATE INDEX "customers_createdAt_idx" ON "customers"("createdAt");

-- CreateIndex
CREATE INDEX "login_codes_email_createdAt_idx" ON "login_codes"("email", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "draws_winnerEntryId_key" ON "draws"("winnerEntryId");

-- CreateIndex
CREATE INDEX "draws_status_endsAt_idx" ON "draws"("status", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "draw_entries_jarCodeId_key" ON "draw_entries"("jarCodeId");

-- CreateIndex
CREATE INDEX "draw_entries_drawId_customerId_idx" ON "draw_entries"("drawId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "jar_codes_code_key" ON "jar_codes"("code");

-- CreateIndex
CREATE INDEX "jar_codes_batch_idx" ON "jar_codes"("batch");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draws" ADD CONSTRAINT "draws_winnerEntryId_fkey" FOREIGN KEY ("winnerEntryId") REFERENCES "draw_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_entries" ADD CONSTRAINT "draw_entries_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "draws"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_entries" ADD CONSTRAINT "draw_entries_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_entries" ADD CONSTRAINT "draw_entries_jarCodeId_fkey" FOREIGN KEY ("jarCodeId") REFERENCES "jar_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jar_codes" ADD CONSTRAINT "jar_codes_usedById_fkey" FOREIGN KEY ("usedById") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

