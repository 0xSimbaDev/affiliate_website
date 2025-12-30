/**
 * StarRating Component
 *
 * Shared star rating display component used across the site.
 * Supports multiple sizes and optional review count display.
 */

import { cn } from '@affiliate/utils'

interface StarRatingProps {
  /** Rating value from 0 to 5 */
  rating: number
  /** Optional review count to display */
  reviewCount?: number | null
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Whether to show the numeric rating */
  showValue?: boolean
  /** Additional CSS classes */
  className?: string
}

const sizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

export function StarRating({
  rating,
  reviewCount,
  size = 'md',
  showValue = true,
  className,
}: StarRatingProps) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      role="img"
      aria-label={`Rating: ${rating.toFixed(1)} out of 5 stars${reviewCount ? `, ${reviewCount} reviews` : ''}`}
    >
      <div className="flex items-center gap-0.5">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            className={cn(sizeClasses[size], 'fill-yellow-400 text-yellow-400')}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <svg
            className={cn(sizeClasses[size], 'text-yellow-400')}
            viewBox="0 0 20 20"
          >
            <defs>
              <linearGradient id="halfStarGradient">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              fill="url(#halfStarGradient)"
              stroke="currentColor"
              strokeWidth="1"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        )}

        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <svg
            key={`empty-${i}`}
            className={cn(sizeClasses[size], 'fill-gray-200 text-gray-200')}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Numeric rating */}
      {showValue && (
        <span className={cn('font-medium text-foreground', textSizeClasses[size])}>
          {rating.toFixed(1)}
        </span>
      )}

      {/* Review count */}
      {reviewCount !== undefined && reviewCount !== null && (
        <span className={cn('text-muted-foreground', textSizeClasses[size])}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  )
}

export default StarRating
