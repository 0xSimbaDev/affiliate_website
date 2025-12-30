/**
 * InlineProductCard Component
 *
 * A compact product card designed for embedding within article content.
 * Renders inline with text flow, optimized for monetization.
 *
 * Variants:
 * - default: Standard horizontal layout
 * - compact: Smaller, minimal version for tight spaces
 * - featured: Larger, more prominent with highlight styling
 */

import Image from 'next/image'
import Link from 'next/link'
import { AffiliateLink } from '../affiliate'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import type { ProductCardData } from '@affiliate/types'

// =============================================================================
// Types
// =============================================================================

interface InlineProductCardProps {
  product: ProductCardData & { primaryAffiliateUrl?: string | null }
  siteSlug: string
  variant?: 'default' | 'compact' | 'featured'
  highlight?: string
  position?: number
  className?: string
}

// =============================================================================
// Helper Functions
// =============================================================================

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

// =============================================================================
// Star Rating Sub-component
// =============================================================================

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
  }

  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5 stars`}>
      {[...Array(fullStars)].map((_, i) => (
        <svg
          key={`full-${i}`}
          className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {hasHalfStar && (
        <svg className={`${sizeClasses[size]} text-yellow-400`} viewBox="0 0 20 20">
          <defs>
            <linearGradient id={`halfGradInline-${rating}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#halfGradInline-${rating})`}
            stroke="currentColor"
            strokeWidth="1"
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg
          key={`empty-${i}`}
          className={`${sizeClasses[size]} fill-gray-200 text-gray-200`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export default function InlineProductCard({
  product,
  siteSlug,
  variant = 'default',
  highlight,
  position,
  className = '',
}: InlineProductCardProps) {
  const productUrl = `/${siteSlug}/products/${product.slug}`

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`my-4 flex items-center gap-4 rounded-lg border border-border bg-card p-3 ${className}`}>
        {/* Image */}
        <Link href={productUrl} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage}
              alt={product.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg className="h-6 w-6 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link href={productUrl}>
            <h4 className="font-medium text-sm truncate hover:text-[var(--site-primary)]">
              {product.title}
            </h4>
          </Link>
          <div className="flex items-center gap-2 mt-1">
            {product.rating !== null && <StarRating rating={product.rating} size="sm" />}
            {product.priceFrom !== null && (
              <span className="text-sm font-semibold">
                {formatPrice(product.priceFrom, product.priceCurrency)}
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        {product.primaryAffiliateUrl && (
          <AffiliateLink href={product.primaryAffiliateUrl} className="shrink-0">
            <Button size="sm" style={{ backgroundColor: 'var(--site-primary)', color: 'white' }}>
              Buy
            </Button>
          </AffiliateLink>
        )}
      </div>
    )
  }

  // Featured variant
  if (variant === 'featured') {
    return (
      <div
        className={`my-6 overflow-hidden rounded-xl border-2 bg-card shadow-sm ${className}`}
        style={{ borderColor: 'var(--site-primary)' }}
      >
        {/* Position badge */}
        {position !== undefined && (
          <div
            className="absolute left-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: 'var(--site-primary)' }}
          >
            {position}
          </div>
        )}

        <div className="grid gap-4 p-5 sm:grid-cols-[160px_1fr]">
          {/* Image */}
          <Link href={productUrl} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {product.featuredImage ? (
              <Image
                src={product.featuredImage}
                alt={product.title}
                fill
                className="object-cover transition-transform hover:scale-105"
                sizes="160px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <svg className="h-10 w-10 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </Link>

          {/* Content */}
          <div className="flex flex-col justify-between">
            <div>
              {product.isFeatured && (
                <Badge className="mb-2 bg-yellow-500 text-yellow-950 hover:bg-yellow-500">
                  Top Pick
                </Badge>
              )}
              <Link href={productUrl}>
                <h3 className="text-lg font-semibold hover:text-[var(--site-primary)]">
                  {product.title}
                </h3>
              </Link>

              {/* Rating */}
              {product.rating !== null && (
                <div className="mt-2 flex items-center gap-2">
                  <StarRating rating={product.rating} size="md" />
                  <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                </div>
              )}

              {/* Highlight */}
              {highlight && (
                <p className="mt-2 text-sm font-medium" style={{ color: 'var(--site-primary)' }}>
                  {highlight}
                </p>
              )}

              {/* Excerpt */}
              {product.excerpt && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {product.excerpt}
                </p>
              )}
            </div>

            {/* Price & CTA */}
            <div className="mt-4 flex items-center justify-between">
              {product.priceFrom !== null && (
                <span className="text-xl font-bold">
                  {formatPrice(product.priceFrom, product.priceCurrency)}
                </span>
              )}
              {product.primaryAffiliateUrl && (
                <AffiliateLink href={product.primaryAffiliateUrl}>
                  <Button style={{ backgroundColor: 'var(--site-primary)', color: 'white' }}>
                    Check Price
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Button>
                </AffiliateLink>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={`my-5 overflow-hidden rounded-xl border border-border bg-card ${className}`}>
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        {/* Position badge */}
        {position !== undefined && (
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: 'var(--site-primary)' }}
          >
            {position}
          </div>
        )}

        {/* Image */}
        <Link href={productUrl} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-20 sm:w-20">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage}
              alt={product.title}
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes="96px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg className="h-8 w-8 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link href={productUrl}>
            <h4 className="font-semibold hover:text-[var(--site-primary)]">
              {product.title}
            </h4>
          </Link>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            {product.rating !== null && (
              <div className="flex items-center gap-1">
                <StarRating rating={product.rating} size="sm" />
                <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
              </div>
            )}
            {highlight && (
              <span className="text-xs font-medium" style={{ color: 'var(--site-primary)' }}>
                {highlight}
              </span>
            )}
          </div>

          {product.excerpt && (
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {product.excerpt}
            </p>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
          {product.priceFrom !== null && (
            <span className="text-lg font-bold">
              {formatPrice(product.priceFrom, product.priceCurrency)}
            </span>
          )}
          {product.primaryAffiliateUrl && (
            <AffiliateLink href={product.primaryAffiliateUrl}>
              <Button size="sm" style={{ backgroundColor: 'var(--site-primary)', color: 'white' }}>
                Check Price
              </Button>
            </AffiliateLink>
          )}
        </div>
      </div>
    </div>
  )
}
