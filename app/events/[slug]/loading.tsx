export default function EventLoading() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Image Skeleton */}
            <div className="relative h-[60vh] min-h-[400px] bg-gray-300 animate-pulse" />
            
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Breadcrumb Skeleton */}
                <div className="mb-8 flex gap-2">
                    <div className="h-4 bg-gray-300 rounded w-20 animate-pulse" />
                    <div className="h-4 bg-gray-300 rounded w-20 animate-pulse" />
                    <div className="h-4 bg-gray-300 rounded w-32 animate-pulse" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content Skeleton */}
                    <div className="lg:col-span-2">
                        <div className="h-4 bg-gray-300 rounded w-32 mb-4 animate-pulse" />
                        <div className="h-10 bg-gray-300 rounded w-3/4 mb-6 animate-pulse" />
                        <div className="h-6 bg-gray-300 rounded w-full mb-4 animate-pulse" />
                        
                        <div className="space-y-4 mt-8">
                            <div className="h-4 bg-gray-300 rounded w-full animate-pulse" />
                            <div className="h-4 bg-gray-300 rounded w-full animate-pulse" />
                            <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse" />
                        </div>
                    </div>
                    
                    {/* Sidebar Skeleton */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                <div className="h-6 bg-gray-300 rounded w-32 mb-4 animate-pulse" />
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-300 rounded w-20 animate-pulse" />
                                                <div className="h-4 bg-gray-300 rounded w-full animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="h-12 bg-gray-300 rounded-lg animate-pulse" />
                                <div className="h-12 bg-gray-300 rounded-lg animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
