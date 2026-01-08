import { BannerSkeleton, ProductGridSkeleton, TextSkeleton } from '@/components/skeletons'

export default function RootLoading() {
    return (
        <div className="bg-white text-black">
            <BannerSkeleton />
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-20 space-y-10">
                <div className="text-center space-y-3 animate-pulse">
                    <div className="h-6 w-48 bg-neutral-200 mx-auto" />
                    <div className="h-4 w-64 bg-neutral-200 mx-auto" />
                </div>
                <ProductGridSkeleton count={8} />
                <div className="space-y-2 animate-pulse">
                    <TextSkeleton width="w-32" height="h-3" />
                    <ProductGridSkeleton count={4} />
                </div>
            </div>
        </div>
    )
}
