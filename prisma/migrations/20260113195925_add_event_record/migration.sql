/*
  Warnings:

  - The values [SOLD] on the enum `TicketStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TicketStatus_new" AS ENUM ('AVAILABLE', 'USED', 'CANCELLED');
ALTER TABLE "EventTicket" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "EventTicket" ALTER COLUMN "status" TYPE "TicketStatus_new" USING ("status"::text::"TicketStatus_new");
ALTER TYPE "TicketStatus" RENAME TO "TicketStatus_old";
ALTER TYPE "TicketStatus_new" RENAME TO "TicketStatus";
DROP TYPE "TicketStatus_old";
ALTER TABLE "EventTicket" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;

-- CreateTable
CREATE TABLE "EventRecord" (
    "id" TEXT NOT NULL,
    "sanityId" TEXT NOT NULL,
    "slug" TEXT,
    "title" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "venue" TEXT,
    "address" TEXT,
    "city" TEXT,
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "virtualLink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventRecord_sanityId_key" ON "EventRecord"("sanityId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRecord_slug_key" ON "EventRecord"("slug");

-- CreateIndex
CREATE INDEX "EventRecord_sanityId_idx" ON "EventRecord"("sanityId");

-- CreateIndex
CREATE INDEX "EventRecord_eventDate_idx" ON "EventRecord"("eventDate");
