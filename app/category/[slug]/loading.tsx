import { ProductGridSkeleton } from '@/components/skeletons'

export default function CategoryLoading() {
    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-20">
            <div className="mb-16 text-center space-y-3 animate-pulse">
                <div className="h-8 bg-neutral-200 w-40 mx-auto" />
                <div className="h-4 bg-neutral-200 w-32 mx-auto" />
            </div>

            <ProductGridSkeleton count={12} />
        </div>
    )
}
