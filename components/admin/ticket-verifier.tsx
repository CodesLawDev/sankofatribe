"use client";

import { useState } from "react";
import { QrCode, CheckCircle, Search, Camera } from "lucide-react";
import QrScanner from "./qr-scanner";

interface TicketVerifierProps {
  eventId?: string;
}

export default function TicketVerifier({ eventId }: TicketVerifierProps = {}) {
  const [ticketId, setTicketId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<any>(null);
  const [validated, setValidated] = useState(false);
  const [scanning, setScanning] = useState(false);

  const fetchTicket = async () => {
    setLoading(true);
    setError(null);
    setValidated(false);
    setTicket(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ticket not found");
      }
      const data = await res.json();
      const ticketData = data.ticket ? data.ticket : data;
      
      // Check if ticket belongs to this event (if eventId is specified)
      if (eventId && ticketData.eventId !== eventId) {
        throw new Error("This ticket is not for this event");
      }
      
      setTicket(ticketData);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch ticket");
    } finally {
      setLoading(false);
    }
  };

  const validateTicket = async () => {
    if (!ticket) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/validate-ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticket.ticketId, eventId: ticket.eventId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Validation failed");
      }
      setValidated(true);
      await fetchTicket(); // refresh state
    } catch (e: any) {
      setError(e?.message || "Failed to validate ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleScanDetected = (text: string) => {
    try {
      // QR contains JSON: { ticketId, eventId, ... }
      const parsed = JSON.parse(text);
      if (parsed?.ticketId) {
        setTicketId(parsed.ticketId);
        setScanning(false);
        // Auto-fetch ticket after scan
        setTimeout(() => {
          fetchTicket();
        }, 200);
      } else {
        setError("Invalid QR content: missing ticketId");
      }
    } catch {
      // Some scanners may return raw strings; try direct usage
      if (text && text.startsWith("EVT-") && text.includes("-TK-")) {
        setTicketId(text);
        setScanning(false);
        setTimeout(() => {
          fetchTicket();
        }, 200);
      } else {
        setError("Failed to parse QR content");
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <QrCode className="w-5 h-5" /> Ticket Verification
      </h3>
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={ticketId}
          onChange={(e) => setTicketId(e.target.value.trim())}
          placeholder="Search by Ticket ID, name, email, or phone"
          className="flex-1 min-w-[280px] px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-amber-600 focus:border-transparent"
        />
        <button
          onClick={fetchTicket}
          disabled={loading || !ticketId}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50"
        >
          <Search className="w-4 h-4 inline mr-2" /> Search
        </button>
        <button
          onClick={() => setScanning((s) => !s)}
          className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
        >
          <Camera className="w-4 h-4 inline mr-2" /> {scanning ? "Hide Scanner" : "Scan QR"}
        </button>
      </div>

      {scanning && (
        <div className="mb-4">
          <QrScanner onDetected={handleScanDetected} onClose={() => setScanning(false)} />
        </div>
      )}

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {ticket && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Ticket ID</p>
              <p className="font-mono text-xs text-gray-900">{ticket.ticketId}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${ticket.status === 'USED' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                {ticket.status}
              </span>
            </div>
            <div>
              <p className="text-gray-600">Attendee</p>
              <p className="text-gray-900">{ticket.attendeeName}</p>
            </div>
            <div>
              <p className="text-gray-600">Event ID</p>
              <p className="text-gray-900">{ticket.eventId}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={validateTicket}
              disabled={loading || ticket.status === 'USED'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Validate & Mark Used
            </button>
            {validated && (
              <span className="flex items-center gap-2 text-green-700"><CheckCircle className="w-4 h-4" /> Validated</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
