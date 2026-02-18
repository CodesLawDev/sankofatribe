/*
  Warnings:

  - You are about to drop the `NewsletterSubscriber` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('AVAILABLE', 'SOLD', 'CANCELLED');

-- DropTable
DROP TABLE "NewsletterSubscriber";

-- CreateTable
CREATE TABLE "EventTicketTier" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "sold" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventTicketTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTicketOrder" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "buyerEmail" VARCHAR(255) NOT NULL,
    "buyerPhone" VARCHAR(20),
    "buyerName" VARCHAR(255) NOT NULL,
    "ticketCount" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'GHS',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentReference" TEXT,
    "paymentMethod" TEXT DEFAULT 'paystack',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventTicketOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTicket" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "attendeeEmail" VARCHAR(255) NOT NULL,
    "attendeePhone" VARCHAR(20),
    "attendeeName" VARCHAR(255) NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'AVAILABLE',
    "usedAt" TIMESTAMP(3),
    "walletPassUrl" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventTicketTier_eventId_idx" ON "EventTicketTier"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventTicketOrder_orderId_key" ON "EventTicketOrder"("orderId");

-- CreateIndex
CREATE INDEX "EventTicketOrder_eventId_idx" ON "EventTicketOrder"("eventId");

-- CreateIndex
CREATE INDEX "EventTicketOrder_paymentStatus_idx" ON "EventTicketOrder"("paymentStatus");

-- CreateIndex
CREATE INDEX "EventTicketOrder_status_idx" ON "EventTicketOrder"("status");

-- CreateIndex
CREATE INDEX "EventTicketOrder_createdAt_idx" ON "EventTicketOrder"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EventTicket_ticketId_key" ON "EventTicket"("ticketId");

-- CreateIndex
CREATE INDEX "EventTicket_eventId_idx" ON "EventTicket"("eventId");

-- CreateIndex
CREATE INDEX "EventTicket_orderId_idx" ON "EventTicket"("orderId");

-- CreateIndex
CREATE INDEX "EventTicket_status_idx" ON "EventTicket"("status");

-- CreateIndex
CREATE INDEX "EventTicket_attendeeEmail_idx" ON "EventTicket"("attendeeEmail");

-- AddForeignKey
ALTER TABLE "EventTicketOrder" ADD CONSTRAINT "EventTicketOrder_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "EventTicketTier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicket" ADD CONSTRAINT "EventTicket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "EventTicketOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
