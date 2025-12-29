'use client'

/**
 * Related Products Section
 *
 * Grid of related products based on product type.
 * Links to full products listing.
 */

import Link from 'next/link'
import { useProductPage } from '../../context'
import type { SectionProps } from '../../types'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/components/products/ProductCard'

interface RelatedProductsProps extends SectionProps {
  /** Section heading */
  heading?: string
  /** "View all" link text */
  viewAllText?: string
}

export default function RelatedProductsSection({
  className,
  heading = 'Related Products',
  viewAllText = 'View all',
}: RelatedProductsProps) {
  const { relatedProducts, siteSlug } = useProductPage()

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <section className={cn('', className)}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-foreground">
          {heading}
        </h2>
        <Link
          href={`/${siteSlug}/products`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {viewAllText}
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((relatedProduct) => (
          <ProductCard
            key={relatedProduct.id}
            product={relatedProduct}
            siteSlug={siteSlug}
            variant="compact"
            showAffiliateBadge={false}
          />
        ))}
      </div>
    </section>
  )
}
