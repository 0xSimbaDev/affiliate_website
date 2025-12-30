/**
 * InlineProductGrid Component
 *
 * Displays a grid of products within article content.
 * Used for [products:category-slug] shortcodes.
 */

import InlineProductCard from './InlineProductCard'
import type { ProductCardData } from '@affiliate/types'

interface InlineProductGridProps {
  products: (ProductCardData & { primaryAffiliateUrl?: string | null })[]
  siteSlug: string
  title?: string
  columns?: 1 | 2
  className?: string
}

export default function InlineProductGrid({
  products,
  siteSlug,
  title,
  columns = 2,
  className = '',
}: InlineProductGridProps) {
  if (products.length === 0) {
    return null
  }

  const gridCols = columns === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'

  return (
    <div className={`my-8 ${className}`}>
      {title && (
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      )}
      <div className={`grid gap-4 ${gridCols}`}>
        {products.map((product, index) => (
          <InlineProductCard
            key={product.id}
            product={product}
            siteSlug={siteSlug}
            variant="compact"
            position={index + 1}
          />
        ))}
      </div>
    </div>
  )
}
