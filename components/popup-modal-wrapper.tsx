'use client'

import { useEffect, useState } from 'react'
import { Event, Campaign } from '@/lib/sanity'
import PopupModal from './popup-modal'

interface PopupModalWrapperProps {
  popupEvent: Event | null
  popupCampaign: Campaign | null
}

export default function PopupModalWrapper({ popupEvent, popupCampaign }: PopupModalWrapperProps) {
  const [isClient, setIsClient] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [currentPopup, setCurrentPopup] = useState<{ item: Event | Campaign; type: 'event' | 'campaign' } | null>(null)

  useEffect(() => {
    setIsClient(true)

    // Check if user has seen this popup before
    const seenPopups = localStorage.getItem('seenPopups')
    const seenPopupsList = seenPopups ? JSON.parse(seenPopups) : []

    // Prefer event over campaign
    if (popupEvent && !seenPopupsList.includes(popupEvent._id)) {
      setCurrentPopup({ item: popupEvent, type: 'event' })
      setShowPopup(true)
    } else if (popupCampaign && !seenPopupsList.includes(popupCampaign._id)) {
      setCurrentPopup({ item: popupCampaign, type: 'campaign' })
      setShowPopup(true)
    }
  }, [popupEvent, popupCampaign])

  const handleClose = () => {
    if (currentPopup) {
      const seenPopups = localStorage.getItem('seenPopups')
      const seenPopupsList = seenPopups ? JSON.parse(seenPopups) : []
      
      if (!seenPopupsList.includes(currentPopup.item._id)) {
        seenPopupsList.push(currentPopup.item._id)
        localStorage.setItem('seenPopups', JSON.stringify(seenPopupsList))
      }
    }
    setShowPopup(false)
  }

  if (!isClient || !showPopup || !currentPopup) {
    return null
  }

  return (
    <PopupModal
      item={currentPopup.item}
      type={currentPopup.type}
      onClose={handleClose}
    />
  )
}
