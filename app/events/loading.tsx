export default function EventsLoading() {
    return (
        <div className="min-h-screen bg-brand-cream">
            {/* Hero Section Skeleton */}
            <section className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="h-12 bg-white/20 rounded-lg w-3/4 mx-auto mb-6 animate-pulse" />
                    <div className="h-6 bg-white/20 rounded-lg w-2/3 mx-auto animate-pulse" />
                </div>
            </section>
            
            {/* Featured Events Skeleton */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-8 bg-neutral-200 rounded w-48 mb-8 animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white border border-brand-primary/10 rounded-lg overflow-hidden shadow-sm">
                            <div className="h-[400px] bg-neutral-200 animate-pulse" />
                            <div className="p-6 space-y-4">
                                <div className="h-4 bg-neutral-200 rounded w-24 animate-pulse" />
                                <div className="h-6 bg-neutral-200 rounded w-3/4 animate-pulse" />
                                <div className="h-4 bg-neutral-200 rounded w-full animate-pulse" />
                                <div className="h-4 bg-neutral-200 rounded w-2/3 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            
            {/* Upcoming Events Skeleton */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-8 bg-neutral-200 rounded w-56 mb-8 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white border border-brand-primary/10 rounded-lg overflow-hidden shadow-sm">
                            <div className="h-[280px] bg-neutral-200 animate-pulse" />
                            <div className="p-6 space-y-4">
                                <div className="h-4 bg-neutral-200 rounded w-24 animate-pulse" />
                                <div className="h-6 bg-neutral-200 rounded w-3/4 animate-pulse" />
                                <div className="h-4 bg-neutral-200 rounded w-full animate-pulse" />
                                <div className="h-4 bg-neutral-200 rounded w-1/2 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
