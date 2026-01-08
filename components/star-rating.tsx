'use client'

import { Star } from 'lucide-react'

interface StarRatingProps {
    rating: number
    maxRating?: number
    size?: 'sm' | 'md' | 'lg'
    showNumber?: boolean
    interactive?: boolean
    onRatingChange?: (rating: number) => void
}

const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
}

export default function StarRating({
    rating,
    maxRating = 5,
    size = 'md',
    showNumber = false,
    interactive = false,
    onRatingChange,
}: StarRatingProps) {
    const handleClick = (value: number) => {
        if (interactive && onRatingChange) {
            onRatingChange(value)
        }
    }

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: maxRating }, (_, index) => {
                const starValue = index + 1
                const isFilled = starValue <= rating
                const isPartial = starValue > rating && starValue - 1 < rating

                return (
                    <button
                        key={index}
                        onClick={() => handleClick(starValue)}
                        disabled={!interactive}
                        className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                        aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
                    >
                        <Star
                            className={`${sizeClasses[size]} ${isFilled || isPartial ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                        />
                    </button>
                )
            })}
            {showNumber && (
                <span className="text-xs text-neutral-600 ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    )
}
