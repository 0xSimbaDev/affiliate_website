'use client'

/**
 * Hero Section
 *
 * Main product hero with image gallery and key info.
 * Features: Gallery, title, rating, price, category tag, descriptions.
 *
 * Supports split rendering via props:
 * - galleryOnly: Only render the image gallery
 * - infoOnly: Only render the product info (no gallery)
 */

import Link from 'next/link'
import { useProductPage } from '../../context'
import type { SectionProps } from '../../types'
import { cn } from '@/lib/utils'
import ImageGallery from '@/app/[site]/products/[slug]/_components/ImageGallery'

/**
 * Star Rating Component
 */
function StarRating({
  rating,
  reviewCount,
}: {
  rating: number
  reviewCount?: number | null
}) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div
      className="flex items-center gap-2"
      role="img"
      aria-label={`Rating: ${rating.toFixed(1)} out of 5 stars${reviewCount ? `, ${reviewCount} reviews` : ''}`}
    >
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
          const isFull = i < fullStars
          const isHalf = i === fullStars && hasHalfStar

          return (
            <svg
              key={i}
              className={cn(
                'w-5 h-5',
                isFull || isHalf ? 'text-amber-400' : 'text-muted-foreground/20'
              )}
              fill={isFull ? 'currentColor' : isHalf ? 'url(#half-star)' : 'currentColor'}
              viewBox="0 0 20 20"
            >
              {isHalf && (
                <defs>
                  <linearGradient id="half-star">
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              )}
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )
        })}
      </div>
      <span className="text-base font-semibold text-foreground">{rating.toFixed(1)}</span>
      {reviewCount && (
        <span className="text-sm text-muted-foreground">({reviewCount.toLocaleString()} reviews)</span>
      )}
    </div>
  )
}

interface HeroSectionProps extends SectionProps {
  /** Only render the image gallery */
  galleryOnly?: boolean
  /** Only render the product info (no gallery) */
  infoOnly?: boolean
}

export default function HeroSection({
  className,
  galleryOnly = false,
  infoOnly = false,
}: HeroSectionProps) {
  const {
    product,
    siteSlug,
    allImages,
    rating,
    price,
    primaryCategory,
  } = useProductPage()

  // Gallery-only mode - just render the gallery
  if (galleryOnly) {
    return <ImageGallery images={allImages} alt={product.title} />
  }

  // Info-only mode - just render the product info
  if (infoOnly) {
    return (
      <>
        {/* Category Tag */}
        {primaryCategory && (
          <Link
            href={`/${siteSlug}/categories/${primaryCategory.slug}`}
            className={cn(
              'inline-block text-xs font-semibold uppercase tracking-wider',
              'hover:opacity-80 transition-opacity'
            )}
            style={{ color: 'var(--site-primary)' }}
          >
            {primaryCategory.name}
          </Link>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
          {product.title}
        </h1>

        {/* Rating */}
        {rating !== null && (
          <StarRating rating={rating} reviewCount={product.reviewCount} />
        )}

        {/* Price */}
        {price.primary && (
          <div className="flex items-baseline gap-2">
            {product.priceFrom !== null && !price.secondary && (
              <span className="text-sm text-muted-foreground">From</span>
            )}
            <span className="text-3xl font-bold text-foreground">
              {price.primary}
            </span>
            {price.secondary && (
              <>
                <span className="text-muted-foreground">-</span>
                <span className="text-3xl font-bold text-foreground">
                  {price.secondary}
                </span>
              </>
            )}
            {price.text && (
              <span className="text-sm text-muted-foreground">
                {price.text}
              </span>
            )}
          </div>
        )}

        {/* Short Description */}
        {product.excerpt && (
          <p className="text-base text-muted-foreground leading-relaxed">
            {product.excerpt}
          </p>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-base text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        )}
      </>
    )
  }

  // Full mode - render both gallery and info (for single-column layouts)
  return (
    <div className={cn('grid lg:grid-cols-2 gap-8 lg:gap-12', className)}>
      {/* Image Gallery */}
      <div className="lg:sticky lg:top-8 lg:self-start">
        <ImageGallery images={allImages} alt={product.title} />
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Category Tag */}
        {primaryCategory && (
          <Link
            href={`/${siteSlug}/categories/${primaryCategory.slug}`}
            className={cn(
              'inline-block text-xs font-semibold uppercase tracking-wider',
              'hover:opacity-80 transition-opacity'
            )}
            style={{ color: 'var(--site-primary)' }}
          >
            {primaryCategory.name}
          </Link>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
          {product.title}
        </h1>

        {/* Rating */}
        {rating !== null && (
          <StarRating rating={rating} reviewCount={product.reviewCount} />
        )}

        {/* Price */}
        {price.primary && (
          <div className="flex items-baseline gap-2">
            {product.priceFrom !== null && !price.secondary && (
              <span className="text-sm text-muted-foreground">From</span>
            )}
            <span className="text-3xl font-bold text-foreground">
              {price.primary}
            </span>
            {price.secondary && (
              <>
                <span className="text-muted-foreground">-</span>
                <span className="text-3xl font-bold text-foreground">
                  {price.secondary}
                </span>
              </>
            )}
            {price.text && (
              <span className="text-sm text-muted-foreground">
                {price.text}
              </span>
            )}
          </div>
        )}

        {/* Short Description */}
        {product.excerpt && (
          <p className="text-base text-muted-foreground leading-relaxed">
            {product.excerpt}
          </p>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-base text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        )}
      </div>
    </div>
  )
}
