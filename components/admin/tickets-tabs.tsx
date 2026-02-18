'use client';

import { useState, ReactNode } from 'react';
import { LayoutGrid, ShoppingCart, Users, QrCode } from 'lucide-react';

interface TabsProps {
  overviewContent: ReactNode;
  ordersContent: ReactNode;
  attendeesContent: ReactNode;
}

type TabId = 'overview' | 'orders' | 'attendees';

const tabs: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'attendees', label: 'Attendees & Verification', icon: Users },
];

export default function TicketsTabs({ overviewContent, ordersContent, attendeesContent }: TabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const content: Record<TabId, ReactNode> = {
    overview: overviewContent,
    orders: ordersContent,
    attendees: attendeesContent,
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
        <nav className="flex flex-wrap gap-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>{content[activeTab]}</div>
    </div>
  );
}
