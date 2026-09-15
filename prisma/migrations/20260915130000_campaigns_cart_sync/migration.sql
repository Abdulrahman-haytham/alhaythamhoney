-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SENDING', 'SENT');

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "cartJson" JSONB,
ADD COLUMN     "cartRemindedAt" TIMESTAMP(3),
ADD COLUMN     "cartUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "unsubscribeToken" TEXT;

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "abandonedCartEmailEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "abandonedCartHours" INTEGER NOT NULL DEFAULT 24;

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "recipientsCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_recipients" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "campaign_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaigns_status_createdAt_idx" ON "campaigns"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_recipients_token_key" ON "campaign_recipients"("token");

-- CreateIndex
CREATE INDEX "campaign_recipients_campaignId_sentAt_idx" ON "campaign_recipients"("campaignId", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_recipients_campaignId_customerId_key" ON "campaign_recipients"("campaignId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_unsubscribeToken_key" ON "customers"("unsubscribeToken");

-- AddForeignKey
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

