'use client';

import { useState } from 'react';
import { X, User, Mail, Phone, Ticket } from 'lucide-react';

interface TicketTier {
  id?: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sold?: number;
}

interface AttendeeInfo {
  name: string;
  email: string;
  phone: string;
}

interface TicketPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  ticketTiers: TicketTier[];
  currency?: string;
  onPurchaseComplete?: (orderId: string) => void;
}

export default function TicketPurchaseModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  ticketTiers,
  currency = 'GHS',
  onPurchaseComplete,
}: TicketPurchaseModalProps) {
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(
    ticketTiers.length > 0 ? ticketTiers[0] : null
  );
  const [ticketCount, setTicketCount] = useState(1);
  const [attendees, setAttendees] = useState<AttendeeInfo[]>([
    { name: '', email: '', phone: '' },
  ]);
  // Buyer info will be derived from the first attendee; no separate inputs
  const [buyerInfo, setBuyerInfo] = useState({ name: '', email: '', phone: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const getAvailableTickets = (tier: TicketTier) => {
    return tier.quantity - (tier.sold || 0);
  };

  const handleTierChange = (tier: TicketTier) => {
    setSelectedTier(tier);
    const available = getAvailableTickets(tier);
    if (ticketCount > available) {
      setTicketCount(Math.min(available, 1));
      setAttendees([{ name: '', email: '', phone: '' }]);
    }
  };

  const handleTicketCountChange = (count: number) => {
    if (!selectedTier) return;
    const available = getAvailableTickets(selectedTier);
    const newCount = Math.max(1, Math.min(count, available, 10)); // Max 10 tickets per purchase
    setTicketCount(newCount);

    // Adjust attendees array
    const newAttendees = [...attendees];
    if (newCount > attendees.length) {
      for (let i = attendees.length; i < newCount; i++) {
        newAttendees.push({ name: '', email: '', phone: '' });
      }
    } else {
      newAttendees.length = newCount;
    }
    setAttendees(newAttendees);
  };

  const updateAttendee = (index: number, field: keyof AttendeeInfo, value: string) => {
    const newAttendees = [...attendees];
    newAttendees[index][field] = value;
    setAttendees(newAttendees);
    
    // Clear error for this field
    const errorKey = `attendee-${index}-${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate attendees only
    attendees.forEach((attendee, index) => {
      if (!attendee.name.trim()) {
        newErrors[`attendee-${index}-name`] = 'Name is required';
      }
      if (!attendee.email.trim()) {
        newErrors[`attendee-${index}-email`] = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(attendee.email)) {
        newErrors[`attendee-${index}-email`] = 'Invalid email';
      }
      if (!attendee.phone.trim()) {
        newErrors[`attendee-${index}-phone`] = 'Phone is required';
      } else if (!/^[0-9+\s()-]{10,}$/.test(attendee.phone)) {
        newErrors[`attendee-${index}-phone`] = 'Invalid phone';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePurchase = async () => {
    if (!selectedTier) return;
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Initiate ticket purchase
      // Derive buyer info from the first attendee
      const primaryAttendee = attendees[0];

      const response = await fetch(`/api/events/${eventId}/purchase-tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Always send the tier name to match backend lookup
          tierId: selectedTier.name,
          ticketCount,
          buyerEmail: primaryAttendee.email,
          buyerPhone: primaryAttendee.phone,
          buyerName: primaryAttendee.name,
          attendees,
          totalAmount: selectedTier.price * ticketCount,
          currency,
          // Provide tier details to allow backend to upsert tier if missing
          tierPrice: selectedTier.price,
          tierQuantity: selectedTier.quantity,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to initiate purchase');
      }

      const { orderId, paymentUrl, reference } = await response.json();

      // Redirect to payment provider
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else if (reference) {
        // For free tickets or direct processing
        if (onPurchaseComplete) {
          onPurchaseComplete(orderId);
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert(error instanceof Error ? error.message : 'Failed to process purchase. Please try again.');
      setIsProcessing(false);
    }
  };

  const totalPrice = selectedTier ? selectedTier.price * ticketCount : 0;
  const isFree = selectedTier && selectedTier.price === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-brand-cream rounded-xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-brand-cream border-b border-brand-primary/10 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark">Purchase Tickets</h2>
            <p className="text-sm text-neutral-600 mt-1">{eventTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-brand-dark transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
            disabled={isProcessing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Ticket Tier Selection */}
          {ticketTiers.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-brand-dark/90 mb-3">
                Select Ticket Type
              </label>
              <div className="space-y-2">
                {ticketTiers.map((tier) => {
                  const available = getAvailableTickets(tier);
                  const isUnavailable = available <= 0;
                  
                  return (
                    <button
                      key={tier.id || tier.name}
                      onClick={() => !isUnavailable && handleTierChange(tier)}
                      disabled={isUnavailable || isProcessing}
                      className={`w-full text-left p-4 border rounded-lg transition ${
                        selectedTier?.name === tier.name
                          ? 'border-amber-600 bg-amber-50'
                          : isUnavailable
                          ? 'border-brand-primary/10 bg-neutral-100 opacity-50 cursor-not-allowed'
                          : 'border-brand-primary/20 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-brand-dark">{tier.name}</h3>
                          {tier.description && (
                            <p className="text-sm text-neutral-600 mt-1">{tier.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-brand-dark">
                            {tier.price === 0 ? 'FREE' : `${currency} ${tier.price.toFixed(2)}`}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {available} available
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ticket Quantity */}
          {selectedTier && (
            <div>
              <label className="block text-sm font-medium text-brand-dark/90 mb-2">
                Number of Tickets
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleTicketCountChange(ticketCount - 1)}
                  disabled={ticketCount <= 1 || isProcessing}
                  className="px-4 py-2 border border-brand-primary/20 bg-brand-cream text-brand-dark rounded-lg hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
                >
                  -
                </button>
                <input
                  type="number"
                  value={ticketCount}
                  onChange={(e) => handleTicketCountChange(parseInt(e.target.value) || 1)}
                  disabled={isProcessing}
                  className="w-20 text-center border border-brand-primary/20 rounded-lg py-2 text-brand-dark bg-brand-cream"
                  min="1"
                  max={Math.min(getAvailableTickets(selectedTier), 10)}
                />
                <button
                  onClick={() => handleTicketCountChange(ticketCount + 1)}
                  disabled={ticketCount >= Math.min(getAvailableTickets(selectedTier), 10) || isProcessing}
                  className="px-4 py-2 border border-brand-primary/20 bg-brand-cream text-brand-dark rounded-lg hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
                >
                  +
                </button>
                <span className="text-sm text-brand-dark ml-2">
                  Max: {Math.min(getAvailableTickets(selectedTier), 10)} tickets
                </span>
              </div>
            </div>
          )}

          {/* Buyer Information removed: derive from first attendee */}

          {/* Attendee Information */}
          <div>
            <h3 className="text-lg font-semibold text-brand-dark mb-3 flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Attendee Information
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Each ticket will have the attendee&apos;s name on it. Please ensure all information is accurate.
            </p>
            <div className="space-y-6">
              {attendees.map((attendee, index) => (
                <div key={index} className="p-4 border border-brand-primary/10 rounded-lg bg-white">
                  <h4 className="font-medium text-brand-dark mb-3">Ticket {index + 1}</h4>
                  <div className="grid gap-3">
                    <div>
                      <label className="block text-sm font-medium text-brand-dark/90 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={attendee.name}
                        onChange={(e) => updateAttendee(index, 'name', e.target.value)}
                        disabled={isProcessing}
                        className={`w-full px-3 py-2 border rounded-lg bg-brand-cream text-brand-dark focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                          errors[`attendee-${index}-name`] ? 'border-red-500' : 'border-brand-primary/20'
                        }`}
                        placeholder="Attendee full name"
                      />
                      {errors[`attendee-${index}-name`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`attendee-${index}-name`]}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-brand-dark/90 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={attendee.email}
                          onChange={(e) => updateAttendee(index, 'email', e.target.value)}
                          disabled={isProcessing}
                          className={`w-full px-3 py-2 border rounded-lg bg-brand-cream text-brand-dark focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                            errors[`attendee-${index}-email`] ? 'border-red-500' : 'border-brand-primary/20'
                          }`}
                          placeholder="attendee@email.com"
                        />
                        {errors[`attendee-${index}-email`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`attendee-${index}-email`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-dark/90 mb-1">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={attendee.phone}
                          onChange={(e) => updateAttendee(index, 'phone', e.target.value)}
                          disabled={isProcessing}
                          className={`w-full px-3 py-2 border rounded-lg bg-brand-cream text-brand-dark focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                            errors[`attendee-${index}-phone`] ? 'border-red-500' : 'border-brand-primary/20'
                          }`}
                          placeholder="+233 XX XXX XXXX"
                        />
                        {errors[`attendee-${index}-phone`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`attendee-${index}-phone`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

            {/* Payment is always via Hubtel Mobile Money */}
            {selectedTier && selectedTier.price > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-brand-dark mb-3">
                  Payment Method
                </h3>
                <div className="flex items-center gap-3 p-3 border border-amber-600 bg-amber-50 rounded-lg">
                  <div className="w-4 h-4 rounded-full bg-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-brand-dark">Mobile Money (Hubtel)</p>
                    <p className="text-xs text-neutral-500">MTN MoMo, Telecel Cash, AirtelTigo Money</p>
                  </div>
                </div>
              </div>
            )}

          {/* Order Summary */}
          <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-lg p-4">
            <h3 className="font-semibold text-brand-dark mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-dark">Ticket Type:</span>
                <span className="font-medium text-brand-dark">{selectedTier?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-dark">Quantity:</span>
                <span className="font-medium text-brand-dark">{ticketCount} ticket{ticketCount > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-dark">Price per ticket:</span>
                <span className="font-medium text-brand-dark">
                  {isFree ? 'FREE' : `${currency} ${selectedTier?.price.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t border-brand-primary/10 pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-brand-dark">Total:</span>
                  <span className="text-amber-700">
                    {isFree ? 'FREE' : `${currency} ${totalPrice.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={isProcessing || !selectedTier}
              className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              {isProcessing ? 'Processing...' : isFree ? 'Reserve Tickets' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
