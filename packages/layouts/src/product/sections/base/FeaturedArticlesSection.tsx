'use client'

/**
 * Featured Articles Section
 *
 * Displays articles that feature this product.
 * Provides internal linking and content discovery.
 */

import { useProductPage } from '../../context'
import type { SectionProps } from '../../types'
import { cn } from '@affiliate/utils'
import { FeaturedInArticles } from '@affiliate/ui/products'

export default function FeaturedArticlesSection({ className }: SectionProps) {
  const { featuredArticles, siteSlug, contentSlug } = useProductPage()

  if (featuredArticles.length === 0) {
    return null
  }

  return (
    <FeaturedInArticles
      articles={featuredArticles}
      siteSlug={siteSlug}
      contentSlug={contentSlug}
      className={cn('', className)}
    />
  )
}
