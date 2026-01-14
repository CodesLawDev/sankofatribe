import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { client, Event, urlFor } from '@/lib/sanity'
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Events | Sankofa Tribe Fashion',
    description: 'Join us for exclusive fashion shows, pop-up stores, workshops, and community events celebrating African culture and contemporary style.',
    openGraph: {
        title: 'Events | Sankofa Tribe Fashion',
        description: 'Join us for exclusive fashion shows, pop-up stores, workshops, and community events.',
        type: 'website',
    },
}

// Revalidate the events page every 60 seconds (ISR)
export const revalidate = 60

async function getEvents(): Promise<{ featured: Event[], upcoming: Event[], past: Event[] }> {
    const now = new Date().toISOString()
    
    const projection = `{
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
    
    const featuredQuery = `*[_type == "event" && featured == true && coalesce(endDate, eventDate) >= $now] | order(eventDate asc) [0...3]${projection}`
    const upcomingQuery = `*[_type == "event" && status in ["upcoming","ongoing"] && coalesce(endDate, eventDate) >= $now] | order(eventDate asc)${projection}`
    const pastQuery = `*[_type == "event" && (status in ["completed","cancelled"] || coalesce(endDate, eventDate) < $now)] | order(eventDate desc) [0...6]${projection}`
    
    const [featured, upcoming, past] = await Promise.all([
        client.fetch<Event[]>(featuredQuery, { now }),
        client.fetch<Event[]>(upcomingQuery, { now }),
        client.fetch<Event[]>(pastQuery, { now }),
    ])
    
    return { featured, upcoming, past }
}

function formatEventDate(date: string, endDate?: string) {
    const start = new Date(date)
    const options: Intl.DateTimeFormatOptions = { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    }
    
    if (endDate) {
        const end = new Date(endDate)
        return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`
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

function EventCard({ event, featured = false }: { event: Event, featured?: boolean }) {
    const cardSize = featured ? 'lg:col-span-2' : ''
    const imageHeight = featured ? 'h-[400px]' : 'h-[280px]'
    
    return (
        <Link 
            href={`/events/${event.slug.current}`}
            className={`group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${cardSize}`}
        >
            <div className={`relative ${imageHeight} overflow-hidden bg-gray-100`}>
                {event.image && (
                    <Image
                        src={urlFor(event.image).width(800).fit('max').url()}
                        alt={event.title}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                )}
                
                {/* Event Status Badge */}
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                        ${event.status === 'upcoming' ? 'bg-blue-500 text-white' : ''}
                        ${event.status === 'ongoing' ? 'bg-green-500 text-white' : ''}
                        ${event.status === 'completed' ? 'bg-gray-500 text-white' : ''}
                        ${event.status === 'cancelled' ? 'bg-red-500 text-white' : ''}
                    `}>
                        {event.status}
                    </span>
                </div>
                
                {/* Featured Badge */}
                {featured && event.featured && (
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-semibold uppercase tracking-wide">
                            Featured
                        </span>
                    </div>
                )}
            </div>
            
            <div className="p-6">
                {event.category && (
                    <p className="text-sm text-amber-600 font-semibold uppercase tracking-wide mb-2">
                        {event.category.replace('-', ' ')}
                    </p>
                )}
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">
                    {event.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.summary}
                </p>
                
                <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatEventDate(event.eventDate, event.endDate)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatEventTime(event.eventDate)}</span>
                    </div>
                    
                    {event.location && (
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>
                                {event.location.isVirtual 
                                    ? 'Virtual Event' 
                                    : event.location.venue || event.location.city || 'Location TBA'
                                }
                            </span>
                        </div>
                    )}
                </div>
                
                {/* Ticket Info */}
                {event.ticketInfo && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        {event.ticketInfo.isFree ? (
                            <p className="text-sm font-semibold text-gray-900 mb-2">Free Event</p>
                        ) : (
                            <p className="text-sm font-semibold text-gray-900 mb-2">
                                From {event.ticketInfo.currency || 'GHS'} {Math.min(...(event.ticketInfo.ticketTiers?.map((t: any) => t.price) || [0]))}
                            </p>
                        )}
                        {event.ticketInfo.ticketTiers && event.ticketInfo.ticketTiers.length > 0 && (
                            <div className="text-xs text-gray-500">
                                {event.ticketInfo.ticketTiers.map((tier: any) => {
                                    const available = tier.quantity - (tier.sold || 0);
                                    return (
                                        <div key={tier._key || tier.name}>
                                            {tier.name}: {available > 0 ? `${available} available` : 'Sold out'}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
                
                <div className="mt-4 flex items-center text-amber-600 font-semibold">
                    <span>View Details</span>
                    <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </Link>
    )
}

export default async function EventsPage() {
    const { featured, upcoming, past } = await getEvents()
    
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                        Events & Experiences
                    </h1>
                    <p className="text-xl md:text-2xl text-amber-50 max-w-3xl mx-auto">
                        Join us for exclusive fashion shows, pop-up stores, workshops, and community events 
                        celebrating African culture and contemporary style.
                    </p>
                </div>
            </section>
            
            {/* Featured Events */}
            {featured.length > 0 && (
                <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Events</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {featured.map((event) => (
                            <EventCard key={event._id} event={event} featured />
                        ))}
                    </div>
                </section>
            )}
            
            {/* Upcoming Events */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Upcoming Events</h2>
                
                {upcoming.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-xl text-gray-600">No upcoming events at the moment.</p>
                        <p className="text-gray-500 mt-2">Check back soon for exciting new events!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {upcoming.map((event) => (
                            <EventCard key={event._id} event={event} />
                        ))}
                    </div>
                )}
            </section>
            
            {/* Past Events */}
            {past.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Past Events</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {past.map((event) => (
                                <EventCard key={event._id} event={event} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
