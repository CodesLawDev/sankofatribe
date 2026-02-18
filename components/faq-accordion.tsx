'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQItem {
    title: string
    content: string
}

export function FAQAccordion({ item }: { item: FAQItem }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border-b border-gray-100">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left hover:opacity-70 transition-opacity"
            >
                <span className="text-sm font-medium pr-8">{item.title}</span>
                {isOpen ? (
                    <ChevronUp className="h-4 w-4 flex-shrink-0" />
                ) : (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                )}
            </button>
            {isOpen && (
                <div className="pb-6 text-sm text-gray-600 leading-relaxed">
                    {item.content}
                </div>
            )}
        </div>
    )
}
