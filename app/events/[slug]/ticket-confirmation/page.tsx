'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Download, Mail, Ticket, QrCode } from 'lucide-react';
import TicketDownload from '@/components/ticket-download';

interface TicketData {
  ticket: {
    ticketId: string;
    eventId: string;
    attendeeName: string;
    attendeeEmail: string;
    tierName: string;
    qrCode: string;
    status: string;
    createdAt: string;
  };
  order: {
    orderId: string;
    buyerName: string;
    totalAmount: number;
    currency: string;
    paymentStatus: string;
  };
}

export default function TicketConfirmationPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const provider = searchParams.get('provider') || 'paystack';
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setError('No payment reference provided');
        setLoading(false);
        return;
      }

      try {
        // Build request body based on provider
        const body: Record<string, any> = { reference, provider };

        if (provider === 'hubtel') {
          body.clientReference = reference;
        }

        const response = await fetch('/api/events/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json();
          // If retryable (Hubtel webhook delay) and we haven't exhausted retries
          if (errorData.retryable && retryCount < MAX_RETRIES) {
            // Exponential backoff: 5s, 8s, 12s, 18s, 25s
            const delay = (5 + retryCount * 4) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            setRetryCount(prev => prev + 1);
            return; // useEffect will re-trigger via retryCount dependency
          }
          throw new Error(errorData.error || 'Payment verification failed');
        }

        const data = await response.json();
        
        if (data.success && data.tickets) {
          // Fetch full ticket data for each ticket
          const ticketPromises = data.tickets.map(async (t: any) => {
            const ticketResponse = await fetch(`/api/tickets/${t.ticketId}`);
            return ticketResponse.json();
          });
          
          const ticketsData = await Promise.all(ticketPromises);
          setTickets(ticketsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [reference, retryCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
        <div className="bg-brand-cream border border-brand-primary/10 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-dark mb-2">Payment Failed</h1>
          <p className="text-neutral-600 mb-6">{error}</p>
          <Link
            href="/events"
            className="inline-block px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
        <div className="bg-brand-cream border border-brand-primary/10 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-neutral-600">No tickets found</p>
          <Link
            href="/events"
            className="inline-block mt-4 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const firstTicket = tickets[0];

  return (
    <div className="min-h-screen bg-brand-cream py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="bg-brand-cream border border-brand-primary/10 rounded-lg shadow-lg p-8 mb-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-brand-dark mb-2">
            Payment Successful!
          </h1>
          <p className="text-neutral-600 mb-4">
            Your tickets have been sent to <strong>{firstTicket.ticket.attendeeEmail}</strong>
          </p>
          <p className="text-sm text-neutral-500">
            Order ID: {firstTicket.order.orderId}
          </p>
        </div>

        {/* Tickets */}
        <div className="space-y-4">
          {tickets.map((ticketData, index) => (
            <div
              key={ticketData.ticket.ticketId}
              id={`ticket-${ticketData.ticket.ticketId}`}
              className="bg-brand-cream rounded-lg shadow-lg border border-brand-primary/10 overflow-hidden"
            >
              <div className="bg-brand-cream border-b border-brand-primary/10 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-brand-accent"></div>
                    <span className="font-bold text-brand-accent text-sm tracking-wide">CODETICKETS</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-brand-dark">Ticket {index + 1} of {tickets.length}</div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Meta Row - Tier and Attendee */}
                <div className="border-b border-brand-primary/10 pb-4 mb-6">
                  <div className="flex justify-between items-start gap-6">
                    <div>
                      <p className="text-xs text-neutral-500 font-semibold tracking-wider mb-1">TICKET</p>
                      <p className="text-xl font-black text-brand-dark uppercase tracking-wide">{ticketData.ticket.tierName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-500 font-semibold tracking-wider mb-1">ATTENDEE</p>
                      <p className="text-sm font-semibold text-brand-dark">{ticketData.ticket.attendeeName}</p>
                    </div>
                  </div>
                </div>

                {/* Attendee Info - Centered and Bold */}
                <div className="text-center mb-6 pb-6 border-b border-brand-primary/10">
                  <h2 className="text-3xl font-black text-brand-dark mb-2 uppercase tracking-wide">{ticketData.ticket.attendeeName}</h2>
                  <p className="text-sm text-neutral-600 mb-1">{ticketData.ticket.attendeeEmail}</p>
                  <p className="text-xs text-neutral-500 font-mono mt-2">{ticketData.ticket.ticketId}</p>
                </div>

                {/* QR Code - Enlarged */}
                <div className="bg-brand-cream rounded-lg p-6 text-center mb-4 border border-brand-primary/10">
                  {ticketData.ticket.qrCode && (
                    <img
                      src={ticketData.ticket.qrCode}
                      alt="Ticket QR Code"
                      width={280}
                      height={280}
                      className="mx-auto border-4 border-white rounded-lg shadow-md"
                      crossOrigin="anonymous"
                    />
                  )}
                  <p className="text-xs text-neutral-500 mt-3 font-medium">
                    Scan this code at event entry
                  </p>
                </div>

                {/* Download Buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <TicketDownload 
                    ticketId={ticketData.ticket.ticketId}
                    elementId={`ticket-${ticketData.ticket.ticketId}`}
                    filename={`ticket-${ticketData.ticket.ticketId}.png`}
                  />
                  <a
                    href={`/api/tickets/${ticketData.ticket.ticketId}?format=wallet`}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-cream border border-brand-primary/10 hover:bg-brand-primary/5 rounded-lg transition text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Add to Apple Wallet
                  </a>
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-cream border border-brand-primary/10 hover:bg-brand-primary/5 rounded-lg transition text-sm font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    Print Ticket
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-brand-cream border border-brand-primary/10 rounded-lg shadow-lg p-6 mt-6">
          <h3 className="font-bold text-brand-dark mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Number of Tickets</span>
              <span className="font-semibold">{tickets.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Total Amount</span>
              <span className="font-semibold">
                {firstTicket.order.currency} {firstTicket.order.totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Payment Status</span>
              <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                {firstTicket.order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="font-bold text-blue-900 mb-2">📧 Important Information</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• A confirmation email has been sent to {firstTicket.ticket.attendeeEmail}</li>
            <li>• Each ticket contains a unique QR code for entry validation</li>
            <li>• Please present your QR code (digital or printed) at the event entrance</li>
            <li>• Each QR code can only be scanned once</li>
            <li>• Save this page or download your tickets for offline access</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Link
            href="/events"
            className="flex-1 text-center px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary/90 transition"
          >
            Browse More Events
          </Link>
          <Link
            href={`/events/${firstTicket.ticket.eventId}`}
            className="flex-1 text-center px-6 py-3 border border-brand-primary/20 rounded-lg font-semibold hover:bg-brand-primary/5 transition"
          >
            View Event Details
          </Link>
        </div>
      </div>
    </div>
  );
}
