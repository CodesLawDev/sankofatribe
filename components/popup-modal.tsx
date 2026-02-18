'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import { urlFor } from '@/lib/sanity'
import { Event, Campaign } from '@/lib/sanity'

interface PopupModalProps {
  item: Event | Campaign | null
  type: 'event' | 'campaign'
  onClose: () => void
}

export default function PopupModal({ item, type, onClose }: PopupModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (item) {
      setIsOpen(true)
    }
  }, [item])

  if (!item || !isOpen) return null

  const isEvent = type === 'event'
  const title = isEvent ? (item as Event).title : (item as Campaign).name
  const summary = isEvent ? (item as Event).summary : (item as Campaign).bannerSubtitle
  const image = isEvent ? (item as Event).image : (item as Campaign).bannerImage
  const description = isEvent ? (item as Event).description : (item as Campaign).description
  const link = isEvent ? `/events/${(item as Event).slug.current}` : '#'

  const handleClose = () => {
    setIsOpen(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Image */}
        {image && (
          <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gray-200">
            <Image
              src={urlFor(image).url()}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          
          {summary && (
            <p className="text-lg text-gray-600 mb-4">{summary}</p>
          )}

          {description && (
            <div className="text-gray-700 mb-6 line-clamp-3">
              {typeof description === 'string' ? (
                <p>{description}</p>
              ) : Array.isArray(description) ? (
                <div>
                  {description.map((block: any, idx: number) => (
                    block._type === 'block' && block.children ? (
                      <p key={idx} className="mb-2">
                        {block.children.map((child: any) => child.text).join('')}
                      </p>
                    ) : null
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* Additional Info for Events */}
          {isEvent && (
            <div className="mb-6 text-sm text-gray-600">
              <p>
                📅{' '}
                {new Date((item as Event).eventDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              {(item as Event).location && (item as Event).location?.venue && (
                <p>📍 {(item as Event).location?.venue}</p>
              )}
            </div>
          )}

          {/* Additional Info for Campaigns */}
          {!isEvent && (
            <div className="mb-6 text-sm text-gray-600">
              {(item as Campaign).bannerTitle && (
                <p className="font-semibold text-lg text-gray-900">
                  {(item as Campaign).bannerTitle}
                </p>
              )}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={link}
              onClick={handleClose}
              className="flex-1 bg-black text-white py-3 px-4 rounded font-medium hover:bg-gray-800 transition-colors text-center"
            >
              {isEvent ? 'View Event Details' : 'View Campaign'}
            </Link>
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-200 text-gray-900 py-3 px-4 rounded font-medium hover:bg-gray-300 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
