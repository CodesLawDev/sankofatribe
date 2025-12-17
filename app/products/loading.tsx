import { ProductGridSkeleton } from '@/components/skeletons'

export default function ProductsLoading() {
    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-20">
            <div className="mb-12 text-center">
                <div className="h-8 bg-neutral-200 w-48 mx-auto mb-3 animate-pulse" />
            </div>

            {/* Filter Bar Skeleton */}
            <div className="hidden lg:flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-8">
                    <div className="h-4 bg-neutral-200 w-20 animate-pulse" />
                    <div className="h-4 bg-neutral-200 w-16 animate-pulse" />
                </div>
                <div className="flex items-center gap-6">
                    <div className="h-4 bg-neutral-200 w-24 animate-pulse" />
                    <div className="h-4 bg-neutral-200 w-32 animate-pulse" />
                </div>
            </div>

            <ProductGridSkeleton count={12} />
        </div>
    )
}
