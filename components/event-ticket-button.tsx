'use client';

import { useState } from 'react';
import { Ticket } from 'lucide-react';
import TicketPurchaseModal from './ticket-purchase-modal';

interface TicketTier {
  id?: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sold?: number;
}

interface EventTicketButtonProps {
  eventId: string;
  eventTitle: string;
  ticketTiers: TicketTier[];
  currency?: string;
  isPastEvent: boolean;
  isSoldOut: boolean;
}

export default function EventTicketButton({
  eventId,
  eventTitle,
  ticketTiers,
  currency = 'GHS',
  isPastEvent,
  isSoldOut,
}: EventTicketButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isPastEvent) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center">
        <Ticket className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 font-medium">This event has ended</p>
      </div>
    );
  }

  if (isSoldOut) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <Ticket className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700 font-semibold">SOLD OUT</p>
        <p className="text-red-600 text-sm mt-1">All tickets have been sold</p>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Ticket className="w-5 h-5" />
        Purchase Tickets
      </button>

      <TicketPurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId={eventId}
        eventTitle={eventTitle}
        ticketTiers={ticketTiers}
        currency={currency}
        onPurchaseComplete={(orderId) => {
          setIsModalOpen(false);
          // Redirect to confirmation page or show success message
          window.location.href = `/events/${eventId}/ticket-confirmation?orderId=${orderId}`;
        }}
      />
    </>
  );
}
