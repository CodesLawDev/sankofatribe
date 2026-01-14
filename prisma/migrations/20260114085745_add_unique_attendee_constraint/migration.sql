/*
  Warnings:

  - A unique constraint covering the columns `[eventId,attendeeEmail,attendeePhone]` on the table `EventTicket` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EventTicket_eventId_attendeeEmail_attendeePhone_key" ON "EventTicket"("eventId", "attendeeEmail", "attendeePhone");
