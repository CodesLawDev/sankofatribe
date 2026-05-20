-- AlterTable
ALTER TABLE "Order" ADD COLUMN "followUpEmailSent" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AbandonedCart" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "cartData" JSONB NOT NULL,
    "totalValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "recovered" BOOLEAN NOT NULL DEFAULT false,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbandonedCart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AbandonedCart_email_idx" ON "AbandonedCart"("email");

-- CreateIndex
CREATE INDEX "AbandonedCart_emailSent_idx" ON "AbandonedCart"("emailSent");

-- CreateIndex
CREATE INDEX "AbandonedCart_updatedAt_idx" ON "AbandonedCart"("updatedAt");
