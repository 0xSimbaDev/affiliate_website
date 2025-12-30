/**
 * Featured Product Card Component
 *
 * Large, prominent card for hero product picks on the homepage.
 * Supports both regular and large (featured) sizes.
 */

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@affiliate/utils'
import type { ProductCardData } from '@affiliate/types'

interface FeaturedProductCardProps {
  /** Product data to display */
  product: ProductCardData
  /** Site slug for URL generation */
  siteSlug: string
  /** Whether to render as a large featured card */
  isLarge?: boolean
}

export function FeaturedProductCard({
  product,
  siteSlug,
  isLarge = false,
}: FeaturedProductCardProps) {
  const productUrl = `/${siteSlug}/products/${product.slug}`

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border/50 bg-card',
        'transition-all duration-200 hover:border-border hover:shadow-lg',
        isLarge && 'lg:col-span-2 lg:row-span-2'
      )}
    >
      <Link href={productUrl} className="block h-full">
        {/* Image Area */}
        <div
          className={cn(
            'relative bg-gradient-to-br from-muted to-muted/50',
            isLarge ? 'aspect-[16/10] lg:aspect-[16/9]' : 'aspect-[16/10]'
          )}
        >
          {product.featuredImage ? (
            <Image
              src={product.featuredImage}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={isLarge ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 1024px) 100vw, 33vw'}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className={cn(
                  'text-muted-foreground/20',
                  isLarge ? 'h-24 w-24' : 'h-16 w-16'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={0.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
          )}
          {product.isFeatured && (
            <div
              className="absolute left-3 top-3 rounded-md px-2.5 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: 'var(--site-primary)' }}
            >
              Top Pick
            </div>
          )}
        </div>

        {/* Content */}
        <div className={cn('p-5', isLarge && 'lg:p-6')}>
          <h3
            className={cn(
              'mb-2 font-semibold text-foreground transition-colors group-hover:text-[var(--site-primary)]',
              isLarge ? 'text-xl lg:text-2xl' : 'text-lg'
            )}
          >
            {product.title}
          </h3>
          {product.excerpt && (
            <p
              className={cn(
                'text-muted-foreground',
                isLarge ? 'line-clamp-3 text-sm lg:text-base' : 'line-clamp-2 text-sm'
              )}
            >
              {product.excerpt}
            </p>
          )}

          {/* Rating and Price */}
          <div className="mt-4 flex items-center justify-between">
            {product.rating && (
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              </div>
            )}
            {product.priceFrom && (
              <span className="text-sm font-semibold text-foreground">
                From ${product.priceFrom}
              </span>
            )}
          </div>

          {/* Read More Indicator */}
          <div className="mt-4 flex items-center gap-1.5 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
            <span style={{ color: 'var(--site-primary)' }}>View Details</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              style={{ color: 'var(--site-primary)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </div>
        </div>
      </Link>
    </article>
  )
}
