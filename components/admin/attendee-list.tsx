"use client";

import { useState } from "react";
import { RotateCcw, X } from "lucide-react";

interface Ticket {
  id: string;
  ticketId: string;
  attendeeName: string;
  status: string;
  order?: {
    tier?: {
      name: string;
    };
  };
}

interface AttendeeListProps {
  tickets: Ticket[];
  eventId: string;
}

export default function AttendeeList({ tickets, eventId }: AttendeeListProps) {
  const [localTickets, setLocalTickets] = useState(tickets);
  const [selected, setSelected] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<"confirm" | "revert" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateTicketStatus = (ticketId: string, status: string, usedAt: Date | null = null) => {
    setLocalTickets((prev) =>
      prev.map((t) => (t.ticketId === ticketId ? { ...t, status, usedAt } : t))
    );
    setSelected((prev: any) =>
      prev && prev.ticketId === ticketId ? { ...prev, status, usedAt } : prev
    );
  };

  const closeModal = () => {
    setSelected(null);
    setError(null);
  };

  const fetchDetails = async (ticketId: string) => {
    setDetailLoading(ticketId);
    setError(null);
    try {
      const res = await fetch(
        `/api/events/validate-ticket?ticketId=${encodeURIComponent(ticketId)}&eventId=${encodeURIComponent(eventId)}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load ticket");
      }
      setSelected(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load ticket");
      setSelected(null);
    } finally {
      setDetailLoading(null);
    }
  };

  const confirmTicket = async (ticketId: string) => {
    setActionLoading("confirm");
    setError(null);
    try {
      const res = await fetch(`/api/events/validate-ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, eventId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to check in");
      }
      updateTicketStatus(ticketId, "USED", data.ticket?.usedAt ? new Date(data.ticket.usedAt) : new Date());
    } catch (e: any) {
      setError(e?.message || "Failed to check in attendee");
    } finally {
      setActionLoading(null);
    }
  };

  const revertTicket = async (ticketId: string) => {
    setActionLoading("revert");
    setError(null);
    try {
      const res = await fetch(`/api/events/validate-ticket`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, eventId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to revert");
      }
      updateTicketStatus(ticketId, "AVAILABLE", null);
    } catch (e: any) {
      setError(e?.message || "Failed to revert ticket");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Attendees</h2>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700">
              <th className="py-2 pr-4">Ticket ID</th>
              <th className="py-2 pr-4">Attendee Name</th>
              <th className="py-2 pr-4">Ticket Tier</th>
              <th className="py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {localTickets.map((t) => (
              <tr
                key={t.id}
                role="button"
                tabIndex={0}
                onClick={() => fetchDetails(t.ticketId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") fetchDetails(t.ticketId);
                }}
                className={`border-t border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selected?.ticketId === t.ticketId ? "bg-orange-50" : ""
                }`}
              >
                <td className="py-2 pr-4 font-mono text-xs text-gray-600">{t.ticketId}</td>
                <td className="py-2 pr-4 text-gray-900 font-medium flex items-center gap-2">
                  {t.attendeeName}
                  {detailLoading === t.ticketId && (
                    <span className="text-xs text-gray-500">Loading...</span>
                  )}
                </td>
                <td className="py-2 pr-4 text-gray-900">{t.order?.tier?.name || "N/A"}</td>
                <td className="py-2 pr-4">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      t.status === "USED"
                        ? "bg-green-100 text-green-800"
                        : t.status === "CANCELLED"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
            {localTickets.length === 0 && (
              <tr>
                <td colSpan={4} className="py-3 text-gray-500">
                  No tickets yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div
            className="relative w-full max-w-lg bg-white rounded-lg shadow-xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div>
                <div className="text-xs uppercase text-gray-500">Ticket</div>
                <div className="font-mono text-sm text-gray-900">{selected.ticketId}</div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 py-3 space-y-2">
              <div className="text-base font-semibold text-gray-900">{selected.attendeeName}</div>
              {selected.attendeeEmail && (
                <div className="text-sm text-gray-700">{selected.attendeeEmail}</div>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    selected.status === "USED"
                      ? "bg-green-100 text-green-800"
                      : selected.status === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selected.status}
                </span>
                {selected.tierName && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs bg-white border text-gray-800">
                    {selected.tierName}
                  </span>
                )}
                {selected.paymentStatus && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs bg-white border text-gray-800">
                    Payment: {selected.paymentStatus}
                  </span>
                )}
                {selected.usedAt && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs bg-white border text-gray-800">
                    Used at: {new Date(selected.usedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="px-4 pb-4 pt-2 flex gap-3">
              <button
                onClick={() => confirmTicket(selected.ticketId)}
                disabled={selected.status === "USED" || selected.status === "CANCELLED" || actionLoading === "confirm"}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white text-sm font-semibold shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === "confirm" ? "Checking in..." : "Confirm Check-in"}
              </button>
              <button
                onClick={() => revertTicket(selected.ticketId)}
                disabled={selected.status !== "USED" || actionLoading === "revert"}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                {actionLoading === "revert" ? "Reverting..." : "Revert Check-in"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
