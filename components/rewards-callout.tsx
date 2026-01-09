import Link from 'next/link'
import { Button } from './ui/button'

interface RewardsCalloutProps {
  heading?: string
  title?: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
}

export default function RewardsCallout({
  heading = 'Sankofa Rewards',
  title = 'Earn. Redeem. Enjoy.',
  subtitle = 'Unlock exclusive benefits designed for you, every time you shop.',
  ctaText = 'Learn More',
  ctaLink = '/account',
}: RewardsCalloutProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-700" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 py-20 md:py-28 text-center text-white">
        <p className="text-sm md:text-base opacity-90 mb-4">
          {heading}
        </p>
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
          {title}
        </h2>
        <p className="text-base md:text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          {subtitle}
        </p>
        <Link href={ctaLink}>
          <Button size="lg" variant="secondary" className="bg-transparent border border-white text-white hover:bg-white hover:text-black">
            {ctaText}
          </Button>
        </Link>
      </div>
    </section>
  )
}
