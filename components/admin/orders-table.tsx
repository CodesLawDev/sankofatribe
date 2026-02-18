'use client';

import { useState } from 'react';
import OrderActions from './order-actions';

interface Order {
  id: string;
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string | null;
  ticketCount: number;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  createdAt: string;
  tier: {
    name: string;
  } | null;
}

interface OrdersTableProps {
  orders: Order[];
  paymentBreakdown: Record<string, number>;
}

const formatCurrency = (amount: number | null | undefined, currency = 'GHS') => {
  const value = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
  return `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (value: Date | string | null | undefined) => {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function OrdersTable({ orders: initialOrders, paymentBreakdown: initialBreakdown }: OrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [breakdown, setBreakdown] = useState(initialBreakdown);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prev => 
      prev.map(o => 
        o.id === orderId ? { ...o, paymentStatus: newStatus } : o
      )
    );
    
    // Update breakdown
    setBreakdown(prev => {
      const newBreakdown = { ...prev };
      newBreakdown.pending = Math.max((newBreakdown.pending || 0) - 1, 0);
      newBreakdown[newStatus] = (newBreakdown[newStatus] || 0) + 1;
      return newBreakdown;
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <p className="text-sm text-gray-600">Latest 30 orders for this event.</p>
        </div>
        <div className="flex gap-2 text-xs text-gray-700">
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">success {breakdown.success || 0}</span>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">pending {breakdown.pending || 0}</span>
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">failed {breakdown.failed || 0}</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700">
              <th className="py-2 pr-4">Order ID</th>
              <th className="py-2 pr-4">Buyer</th>
              <th className="py-2 pr-4">Tier</th>
              <th className="py-2 pr-4">Tickets</th>
              <th className="py-2 pr-4">Total</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Created</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-gray-100">
                <td className="py-2 pr-4 font-mono text-xs text-gray-900">{o.orderId}</td>
                <td className="py-2 pr-4">
                  <div className="text-gray-900">{o.buyerName}</div>
                  <div className="text-xs text-gray-500">{o.buyerEmail}</div>
                </td>
                <td className="py-2 pr-4 text-gray-900">{o.tier?.name || '—'}</td>
                <td className="py-2 pr-4 text-gray-900">{o.ticketCount}</td>
                <td className="py-2 pr-4 text-gray-900">{formatCurrency(o.totalAmount, o.currency)}</td>
                <td className="py-2 pr-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    o.paymentStatus === 'success' ? 'bg-green-100 text-green-800' : 
                    o.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="py-2 pr-4 text-gray-900 text-xs">{formatDate(o.createdAt)}</td>
                <td className="py-2 pr-4">
                  <OrderActions 
                    orderId={o.id} 
                    paymentStatus={o.paymentStatus}
                    onStatusChange={(newStatus) => handleStatusChange(o.id, newStatus)}
                  />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="py-3 text-gray-500">No orders yet for this event.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
