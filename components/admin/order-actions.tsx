'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface OrderActionsProps {
  orderId: string;
  paymentStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

export default function OrderActions({ orderId, paymentStatus, onStatusChange }: OrderActionsProps) {
  const [loading, setLoading] = useState<'confirm' | 'fail' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (paymentStatus !== 'pending') {
    return null;
  }

  const handleConfirm = async () => {
    if (loading) return;
    
    setLoading('confirm');
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/admin/tickets/orders/${orderId}/confirm`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to confirm order');
      }

      setResult({ type: 'success', message: data.message || 'Order confirmed!' });
      onStatusChange?.('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm order');
      setResult({ type: 'error', message: err instanceof Error ? err.message : 'Failed to confirm order' });
    } finally {
      setLoading(null);
    }
  };

  const handleFail = async () => {
    if (loading) return;
    
    if (!confirm('Are you sure you want to mark this order as failed? This cannot be undone.')) {
      return;
    }

    setLoading('fail');
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/admin/tickets/orders/${orderId}/fail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Manually marked as failed by admin' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update order');
      }

      setResult({ type: 'success', message: 'Order marked as failed' });
      onStatusChange?.('failed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
      setResult({ type: 'error', message: err instanceof Error ? err.message : 'Failed to update order' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {result ? (
        <span className={`text-xs ${result.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {result.message}
        </span>
      ) : (
        <>
          <button
            onClick={handleConfirm}
            disabled={loading !== null}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Verify payment and generate tickets"
          >
            {loading === 'confirm' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CheckCircle className="w-3 h-3" />
            )}
            Confirm
          </button>
          <button
            onClick={handleFail}
            disabled={loading !== null}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Mark order as failed"
          >
            {loading === 'fail' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            Fail
          </button>
        </>
      )}
    </div>
  );
}
