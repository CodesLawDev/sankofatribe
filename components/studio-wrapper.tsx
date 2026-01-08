"use client"
import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'

export function StudioWrapper() {
  return (
    <div className="bg-white text-black" style={{ minHeight: '100vh' }}>
      <NextStudio config={config} />
    </div>
  )
}
