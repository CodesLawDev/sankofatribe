'use client'

import { useState } from 'react'
import Image from 'next/image'
import { urlFor, SanityImage } from '@/lib/sanity'
import { X } from 'lucide-react'

interface ImageGalleryProps {
    images: SanityImage[]
    productName: string
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0)
    const [isFullScreen, setIsFullScreen] = useState(false)

    return (
        <>
            <div className="space-y-4">
                {/* Main Image */}
                <div
                    className="relative aspect-[3/4] bg-ck-gray-100 overflow-hidden cursor-zoom-in"
                    onClick={() => setIsFullScreen(true)}
                >
                    <Image
                        src={urlFor(images[selectedImage]).width(800).height(1067).url()}
                        alt={`${productName} - Image ${selectedImage + 1}`}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`relative aspect-square bg-ck-gray-100 overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-ck-black' : 'border-transparent'
                                    }`}
                            >
                                <Image
                                    src={urlFor(image).width(200).height(200).url()}
                                    alt={`${productName} thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Full Screen Modal */}
            {isFullScreen && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                    onClick={() => setIsFullScreen(false)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-ck-gray-400"
                        onClick={() => setIsFullScreen(false)}
                    >
                        <X className="h-8 w-8" />
                    </button>
                    <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
                        <Image
                            src={urlFor(images[selectedImage]).width(1600).height(2133).url()}
                            alt={productName}
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            )}
        </>
    )
}
