import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { client, Event, urlFor } from '@/lib/sanity'
import { Calendar, MapPin, Clock, ExternalLink, Globe, Ticket } from 'lucide-react'
import { PortableText } from '@portabletext/react'
import ShareButton from '@/components/share-button'
import EventTicketButton from '@/components/event-ticket-button'

interface Props {
    params: { slug: string }
}

async function getEvent(slug: string): Promise<Event | null> {
    const query = `*[_type == "event" && slug.current == $slug][0]{
        ...,
        "ticketInfo": ticketInfo{
            ...,
            ticketTiers[]{
                _key,
                name,
                description,
                price,
                quantity,
                sold
            }
        }
    }`
    return client.fetch<Event>(query, { slug })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const event = await getEvent(params.slug)
    
    if (!event) {
        return {
            title: 'Event Not Found',
        }
    }
    
    const eventUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sankofatribe.com'}/events/${params.slug}`
    const imageUrl = event.image ? urlFor(event.image).width(1200).height(630).url() : ''
    
    return {
        title: `${event.title} | Sankofa Tribe Events`,
        description: event.summary,
        openGraph: {
            title: event.title,
            description: event.summary,
            type: 'website',
            url: eventUrl,
            images: imageUrl ? [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: event.title,
                }
            ] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: event.title,
            description: event.summary,
            images: imageUrl ? [imageUrl] : [],
        },
    }
}

function formatEventDate(date: string, endDate?: string) {
    const start = new Date(date)
    const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    }
    
    if (endDate) {
        const end = new Date(endDate)
        const endOptions: Intl.DateTimeFormatOptions = { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        }
        return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', endOptions)}`
    }
    
    return start.toLocaleDateString('en-US', options)
}

function formatEventTime(date: string) {
    const eventDate = new Date(date)
    return eventDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    })
}

const portableTextComponents = {
    block: {
        normal: ({ children }: any) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
        h2: ({ children }: any) => <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">{children}</h2>,
        h3: ({ children }: any) => <h3 className="text-xl font-bold mt-6 mb-3 text-gray-900">{children}</h3>,
    },
    list: {
        bullet: ({ children }: any) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">{children}</ul>,
        number: ({ children }: any) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">{children}</ol>,
    },
}

export default async function EventPage({ params }: Props) {
    const event = await getEvent(params.slug)
    
    if (!event) {
        notFound()
    }
    
    const isPastEvent = new Date(event.eventDate) < new Date()
    
    // Check if tickets are available and calculate sold out status
    const hasTicketTiers = event.ticketInfo?.ticketTiers && event.ticketInfo.ticketTiers.length > 0
    const isSoldOut = hasTicketTiers && event.ticketInfo?.ticketTiers?.every(
        (tier: any) => tier.sold >= tier.quantity
    ) || false
    
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Image */}
            <div className="relative h-[60vh] min-h-[400px] bg-gray-900">
                {event.image && (
                    <>
                        <Image
                            src={urlFor(event.image).width(1920).height(1080).url()}
                            alt={event.title}
                            fill
                            className="object-cover opacity-80"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </>
                )}
                
                {/* Event Status */}
                <div className="absolute top-8 right-8 z-10">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide shadow-lg
                        ${event.status === 'upcoming' ? 'bg-blue-500 text-white' : ''}
                        ${event.status === 'ongoing' ? 'bg-green-500 text-white' : ''}
                        ${event.status === 'completed' ? 'bg-gray-500 text-white' : ''}
                        ${event.status === 'cancelled' ? 'bg-red-500 text-white' : ''}
                    `}>
                        {event.status}
                    </span>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Breadcrumb */}
                <nav className="mb-8 text-sm">
                    <ol className="flex items-center gap-2 text-gray-500">
                        <li><Link href="/" className="hover:text-amber-600">Home</Link></li>
                        <li>/</li>
                        <li><Link href="/events" className="hover:text-amber-600">Events</Link></li>
                        <li>/</li>
                        <li className="text-gray-900">{event.title}</li>
                    </ol>
                </nav>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {event.category && (
                            <p className="text-amber-600 font-semibold uppercase tracking-wide mb-4">
                                {event.category.replace('-', ' ')}
                            </p>
                        )}
                        
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            {event.title}
                        </h1>
                        
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            {event.summary}
                        </p>
                        
                        {event.description && (
                            <div className="prose prose-lg max-w-none">
                                <PortableText 
                                    value={event.description} 
                                    components={portableTextComponents}
                                />
                            </div>
                        )}
                        
                        {/* Event Gallery */}
                        {event.gallery && event.gallery.length > 0 && (
                            <div className="mt-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Gallery</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {event.gallery.map((image, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                            <Image
                                                src={urlFor(image).width(400).height(400).url()}
                                                alt={`${event.title} - Gallery ${index + 1}`}
                                                fill
                                                className="object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            {/* Event Details Card */}
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Event Details</h3>
                                
                                <div className="space-y-4">
                                    {/* Date & Time */}
                                    <div className="flex gap-3">
                                        <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Date</p>
                                            <p className="text-gray-600 text-sm">
                                                {formatEventDate(event.eventDate, event.endDate)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Time</p>
                                            <p className="text-gray-600 text-sm">
                                                {formatEventTime(event.eventDate)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Location */}
                                    {event.location && (
                                        <div className="flex gap-3">
                                            {event.location.isVirtual ? (
                                                <Globe className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                                            ) : (
                                                <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-900">Location</p>
                                                {event.location.isVirtual ? (
                                                    <p className="text-gray-600 text-sm">Virtual Event</p>
                                                ) : (
                                                    <div className="text-gray-600 text-sm">
                                                        {event.location.venue && <p>{event.location.venue}</p>}
                                                        {event.location.address && <p>{event.location.address}</p>}
                                                        {event.location.city && <p>{event.location.city}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Ticket Info */}
                                    {event.ticketInfo && (
                                        <div className="flex gap-3">
                                            <Ticket className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                                            <div>
                                                <p className="font-semibold text-gray-900">Ticket</p>
                                                <p className="text-gray-600 text-sm">
                                                    {event.ticketInfo.isFree ? (
                                                        'Free Event'
                                                    ) : hasTicketTiers && event.ticketInfo.ticketTiers && event.ticketInfo.ticketTiers.length > 0 ? (
                                                        `Starting from ${event.ticketInfo.currency || 'GHS'} ${Math.min(...event.ticketInfo.ticketTiers.map((t: any) => t.price))}`
                                                    ) : event.ticketInfo.price ? (
                                                        `${event.ticketInfo.currency || 'GHS'} ${event.ticketInfo.price}`
                                                    ) : (
                                                        'Ticket information available'
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {/* Ticket Purchase - New Integrated System */}
                                {hasTicketTiers && event.ticketInfo?.ticketTiers && (
                                    <EventTicketButton
                                        eventId={event._id}
                                        eventTitle={event.title}
                                        ticketTiers={event.ticketInfo.ticketTiers.map((tier: any) => ({
                                            id: tier._key,
                                            name: tier.name,
                                            description: tier.description,
                                            price: tier.price || 0,
                                            quantity: tier.quantity,
                                            sold: tier.sold || 0,
                                        }))}
                                        currency={event.ticketInfo.currency || 'GHS'}
                                        isPastEvent={isPastEvent}
                                        isSoldOut={isSoldOut}
                                    />
                                )}
                                
                                {/* External Registration (if no ticket tiers) */}
                                {!hasTicketTiers && !isPastEvent && event.registrationUrl && (
                                    <a
                                        href={event.registrationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
                                    >
                                        <span>Register Now</span>
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                )}
                                
                                {/* External Ticket URL (fallback if no ticket tiers) */}
                                {!hasTicketTiers && !isPastEvent && event.ticketInfo?.ticketUrl && !event.ticketInfo.isFree && (
                                    <a
                                        href={event.ticketInfo.ticketUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Ticket className="w-5 h-5" />
                                        <span>Buy Tickets</span>
                                    </a>
                                )}
                                
                                {event.location?.isVirtual && event.location.virtualLink && (
                                    <a
                                        href={event.location.virtualLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span>Join Virtual Event</span>
                                    </a>
                                )}
                                
                                <ShareButton event={event} slug={params.slug} />
                            </div>
                            
                            {/* Back to Events */}
                            <Link
                                href="/events"
                                className="block text-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                            >
                                ← Back to All Events
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
