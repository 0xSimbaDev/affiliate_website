/**
 * InlineComparison Component
 *
 * Side-by-side product comparison table for article content.
 * Used for [comparison:slug1,slug2] shortcodes.
 */

import Image from 'next/image'
import Link from 'next/link'
import { AffiliateLink } from '../affiliate'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import type { ProductCardData } from '@affiliate/types'

interface InlineComparisonProps {
  products: (ProductCardData & { primaryAffiliateUrl?: string | null })[]
  siteSlug: string
  className?: string
}

function formatPrice(price: number | null, currency: string | null): string {
  if (price === null) return 'N/A'
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

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => {
        const isFull = i < fullStars
        const isHalf = i === fullStars && hasHalfStar
        return (
          <svg
            key={i}
            className={`h-4 w-4 ${isFull || isHalf ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )
      })}
    </div>
  )
}

export default function InlineComparison({
  products,
  siteSlug,
  className = '',
}: InlineComparisonProps) {
  if (products.length < 2) {
    return null
  }

  // Determine winner by rating (if available)
  const sortedByRating = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0))
  const winnerId = sortedByRating[0]?.rating ? sortedByRating[0].id : null

  return (
    <div className={`my-8 overflow-hidden rounded-xl border border-border bg-card ${className}`}>
      {/* Header */}
      <div className="border-b border-border bg-muted/50 px-4 py-3">
        <h3 className="font-semibold">Product Comparison</h3>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Product
              </th>
              {products.map((product) => (
                <th key={product.id} className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-2">
                    {winnerId === product.id && (
                      <Badge className="bg-green-500 text-white hover:bg-green-500">
                        Winner
                      </Badge>
                    )}
                    <Link
                      href={`/${siteSlug}/products/${product.slug}`}
                      className="relative mx-auto h-20 w-20 overflow-hidden rounded-lg bg-muted block"
                    >
                      {product.featuredImage ? (
                        <Image
                          src={product.featuredImage}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <svg className="h-8 w-8 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </Link>
                    <Link
                      href={`/${siteSlug}/products/${product.slug}`}
                      className="text-sm font-semibold hover:text-[var(--site-primary)] line-clamp-2 text-center"
                    >
                      {product.title}
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Rating Row */}
            <tr className="border-b border-border">
              <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                Rating
              </td>
              {products.map((product) => (
                <td key={product.id} className="px-4 py-3 text-center">
                  {product.rating !== null ? (
                    <div className="flex flex-col items-center gap-1">
                      <StarRating rating={product.rating} />
                      <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">N/A</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Price Row */}
            <tr className="border-b border-border">
              <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                Price
              </td>
              {products.map((product) => (
                <td key={product.id} className="px-4 py-3 text-center">
                  <span className="text-lg font-bold">
                    {formatPrice(product.priceFrom, product.priceCurrency)}
                  </span>
                </td>
              ))}
            </tr>

            {/* CTA Row */}
            <tr>
              <td className="px-4 py-4 text-sm font-medium text-muted-foreground">
                Buy
              </td>
              {products.map((product) => (
                <td key={product.id} className="px-4 py-4 text-center">
                  {product.primaryAffiliateUrl ? (
                    <AffiliateLink href={product.primaryAffiliateUrl}>
                      <Button
                        size="sm"
                        style={{ backgroundColor: 'var(--site-primary)', color: 'white' }}
                      >
                        Check Price
                      </Button>
                    </AffiliateLink>
                  ) : (
                    <Link href={`/${siteSlug}/products/${product.slug}`}>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </Link>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* VS Dividers (visual only, overlaid) */}
      {products.length === 2 && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
            VS
          </div>
        </div>
      )}
    </div>
  )
}
