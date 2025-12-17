export function ProductCardSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="aspect-[3/4] bg-neutral-200 mb-4" />
            <div className="space-y-2">
                <div className="h-3 bg-neutral-200 w-3/4" />
                <div className="h-3 bg-neutral-200 w-1/4" />
            </div>
        </div>
    )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    )
}

export function ProductDetailSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                {/* Image Gallery Skeleton */}
                <div>
                    <div className="aspect-[3/4] bg-neutral-200 mb-4" />
                    <div className="flex gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="w-20 h-24 bg-neutral-200" />
                        ))}
                    </div>
                </div>

                {/* Product Info Skeleton */}
                <div className="space-y-6 pt-8">
                    <div>
                        <div className="h-6 bg-neutral-200 w-2/3 mb-3" />
                        <div className="h-4 bg-neutral-200 w-1/4" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 bg-neutral-200 w-full" />
                        <div className="h-3 bg-neutral-200 w-full" />
                        <div className="h-3 bg-neutral-200 w-3/4" />
                    </div>
                    <div>
                        <div className="h-3 bg-neutral-200 w-1/4 mb-4" />
                        <div className="flex gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="w-12 h-10 bg-neutral-200" />
                            ))}
                        </div>
                    </div>
                    <div className="h-12 bg-neutral-200 w-full" />
                </div>
            </div>
        </div>
    )
}

export function BannerSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="h-[85vh] md:h-[90vh] bg-neutral-200" />
        </div>
    )
}

export function CartItemSkeleton() {
    return (
        <div className="animate-pulse flex gap-6 pb-8 border-b border-gray-100">
            <div className="w-28 h-36 md:w-32 md:h-44 bg-neutral-200 flex-shrink-0" />
            <div className="flex-grow space-y-3">
                <div className="h-4 bg-neutral-200 w-1/2" />
                <div className="h-3 bg-neutral-200 w-1/4" />
                <div className="h-3 bg-neutral-200 w-1/4" />
                <div className="flex gap-3 mt-6">
                    <div className="w-8 h-8 bg-neutral-200" />
                    <div className="w-10 h-8 bg-neutral-200" />
                    <div className="w-8 h-8 bg-neutral-200" />
                </div>
            </div>
        </div>
    )
}

export function TextSkeleton({ width = 'w-full', height = 'h-4' }: { width?: string; height?: string }) {
    return <div className={`animate-pulse bg-neutral-200 ${width} ${height}`} />
}
