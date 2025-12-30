'use client'

/**
 * ArticleFilters Component
 *
 * Category filter chips for article listing pages.
 * Client component for URL-based filtering.
 */

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@affiliate/ui/ui/badge'

interface CategoryFilter {
  id: string
  slug: string
  name: string
  _count: { articles: number }
}

interface ArticleFiltersProps {
  categories: CategoryFilter[]
  basePath: string
  className?: string
}

export default function ArticleFilters({
  categories,
  basePath,
  className = '',
}: ArticleFiltersProps) {
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category')

  function buildCategoryUrl(categorySlug?: string) {
    if (categorySlug) {
      return `${basePath}?category=${categorySlug}`
    }
    return basePath
  }

  // Don't render if no categories
  if (categories.length === 0) {
    return null
  }

  return (
    <div className={className}>
      {/* Category Chips */}
      <div className="flex flex-wrap gap-2">
        <Link href={buildCategoryUrl()} scroll={false}>
          <Badge
            variant={!currentCategory ? 'default' : 'outline'}
            className={`cursor-pointer transition-colors ${
              !currentCategory
                ? 'bg-[var(--site-primary)] text-white hover:bg-[var(--site-primary)]/90'
                : 'hover:bg-accent'
            }`}
          >
            All
          </Badge>
        </Link>
        {categories.map((category) => {
          const isActive = currentCategory === category.slug
          return (
            <Link
              key={category.id}
              href={buildCategoryUrl(category.slug)}
              scroll={false}
            >
              <Badge
                variant={isActive ? 'default' : 'outline'}
                className={`cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[var(--site-primary)] text-white hover:bg-[var(--site-primary)]/90'
                    : 'hover:bg-accent'
                }`}
              >
                {category.name}
                <span className="ml-1 opacity-70">
                  ({category._count.articles})
                </span>
              </Badge>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
