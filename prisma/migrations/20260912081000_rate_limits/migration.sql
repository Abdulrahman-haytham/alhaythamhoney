CREATE TABLE "rate_limits" (
  "key" TEXT NOT NULL, "count" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("key")
);
CREATE INDEX "rate_limits_expiresAt_idx" ON "rate_limits"("expiresAt");
