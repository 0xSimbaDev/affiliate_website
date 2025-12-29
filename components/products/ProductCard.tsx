import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { ProductCardData } from '@/lib/types'

export interface ProductCardProps {
  product: ProductCardData
  siteSlug: string
  className?: string
  /** Show affiliate badge */
  showAffiliateBadge?: boolean
  /** Card size variant */
  variant?: 'default' | 'compact' | 'featured'
}

/**
 * Format price for display
 */
function formatPrice(price: number | null, currency: string | null): string {
  if (price === null) return ''

  const currencyCode = currency || 'USD'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  } catch {
    return `$${price}`
  }
}

/**
 * Star Rating Component
 * Accessible, visually clean rating display
 */
function StarRating({ rating, reviewCount }: { rating: number; reviewCount?: number }) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div
      className="flex items-center gap-1.5"
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
                'w-4 h-4',
                isFull || isHalf ? 'text-amber-400' : 'text-muted-foreground/20'
              )}
              fill={isFull ? 'currentColor' : isHalf ? 'url(#half)' : 'currentColor'}
              viewBox="0 0 20 20"
            >
              {isHalf && (
                <defs>
                  <linearGradient id="half">
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
      <span className="text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
      {reviewCount && (
        <span className="text-sm text-muted-foreground">({reviewCount})</span>
      )}
    </div>
  )
}

/**
 * ProductCard Component
 *
 * A clean, conversion-focused product card for affiliate sites.
 * Inspired by Wirecutter's product cards with:
 * - Clear visual hierarchy
 * - Trust-building elements (ratings, badges)
 * - Prominent pricing
 * - Subtle hover interactions
 * - Accessible markup
 */
export function ProductCard({
  product,
  siteSlug,
  className,
  showAffiliateBadge = true,
  variant = 'default',
}: ProductCardProps) {
  const productUrl = `/${siteSlug}/products/${product.slug}`
  const priceDisplay = formatPrice(product.priceFrom, product.priceCurrency)

  const isFeatured = variant === 'featured'
  const isCompact = variant === 'compact'

  return (
    <article
      className={cn(
        'group relative bg-card rounded-xl border border-border/50',
        'transition-all duration-200',
        'hover:border-border hover:shadow-lg',
        isFeatured && 'lg:flex lg:gap-6',
        className
      )}
    >
      <Link
        href={productUrl}
        className={cn(
          'block',
          isFeatured && 'lg:flex lg:gap-6 lg:w-full'
        )}
      >
        {/* Image Container */}
        <div
          className={cn(
            'relative overflow-hidden bg-muted',
            isFeatured
              ? 'aspect-[4/3] lg:aspect-square lg:w-72 lg:flex-shrink-0 rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none'
              : isCompact
              ? 'aspect-[3/2] rounded-t-xl'
              : 'aspect-[4/3] rounded-t-xl'
          )}
        >
          {product.featuredImage ? (
            <Image
              src={product.featuredImage}
              alt={product.title}
              fill
              className="object-cover product-image-zoom"
              sizes={
                isFeatured
                  ? '(max-width: 1024px) 100vw, 288px'
                  : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
              }
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg
                className="w-12 h-12 text-muted-foreground/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
          )}

          {/* Featured Badge */}
          {product.isFeatured && (
            <div
              className={cn(
                'absolute top-3 left-3 px-2.5 py-1 rounded-md',
                'text-xs font-medium text-white',
                'bg-foreground/90 backdrop-blur-sm'
              )}
            >
              Top Pick
            </div>
          )}
        </div>

        {/* Content */}
        <div className={cn('p-5', isFeatured && 'lg:flex-1 lg:py-6')}>
          {/* Product Type Tag */}
          {product.productType && !isCompact && (
            <p
              className="text-xs font-medium uppercase tracking-wide mb-2"
              style={{ color: 'var(--site-primary)' }}
            >
              {product.productType.replace(/-/g, ' ')}
            </p>
          )}

          {/* Title */}
          <h3
            className={cn(
              'font-semibold text-foreground leading-snug',
              'group-hover:text-site-primary transition-colors duration-150',
              isFeatured ? 'text-xl lg:text-2xl mb-3' : 'text-lg mb-2',
              isCompact && 'text-base line-clamp-2'
            )}
            style={{ '--site-primary-hover': 'var(--site-primary)' } as React.CSSProperties}
          >
            <span className="group-hover:text-[var(--site-primary)] transition-colors">
              {product.title}
            </span>
          </h3>

          {/* Excerpt */}
          {product.excerpt && !isCompact && (
            <p
              className={cn(
                'text-sm text-muted-foreground leading-relaxed',
                isFeatured ? 'mb-4 line-clamp-3' : 'mb-3 line-clamp-2'
              )}
            >
              {product.excerpt}
            </p>
          )}

          {/* Rating */}
          {product.rating !== null && (
            <div className={cn('mb-4', isCompact && 'mb-3')}>
              <StarRating rating={product.rating} />
            </div>
          )}

          {/* Price and CTA */}
          <div className="flex items-center justify-between gap-4">
            {priceDisplay && (
              <div className="flex items-baseline gap-1.5">
                {product.priceFrom !== null && (
                  <span className="text-xs text-muted-foreground">From</span>
                )}
                <span className="text-xl font-bold text-foreground">
                  {priceDisplay}
                </span>
              </div>
            )}

            {/* View Button - Only show on hover on desktop */}
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-sm font-medium',
                'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                'text-muted-foreground group-hover:text-foreground'
              )}
            >
              View Details
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>

      {/* Affiliate Indicator */}
      {showAffiliateBadge && (
        <div className="absolute top-3 right-3">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-md',
              'text-[10px] font-medium text-muted-foreground',
              'bg-background/90 backdrop-blur-sm border border-border/50'
            )}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
              />
            </svg>
            Affiliate
          </span>
        </div>
      )}
    </article>
  )
}

export default ProductCard
