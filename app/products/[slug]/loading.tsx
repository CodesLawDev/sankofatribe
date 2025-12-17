import { ProductDetailSkeleton } from '@/components/skeletons'

export default function ProductLoading() {
    return (
        <div className="bg-white">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-16">
                {/* Breadcrumb Skeleton */}
                <div className="mb-8 flex gap-2">
                    <div className="h-3 w-4 bg-neutral-200 animate-pulse" />
                    <div className="h-3 w-16 bg-neutral-200 animate-pulse" />
                    <div className="h-3 w-24 bg-neutral-200 animate-pulse" />
                </div>

                <ProductDetailSkeleton />
            </div>
        </div>
    )
}
