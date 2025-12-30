/**
 * Category Card Component
 *
 * Clean navigation card for category browsing on the homepage.
 * Displays category icon/image, name, and product count.
 */

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@affiliate/utils'
import type { Category } from '@affiliate/types'

interface CategoryCardProps {
  /** Category data to display */
  category: Category
  /** Site slug for URL generation */
  siteSlug: string
  /** Number of products in this category */
  productCount: number
}

export function CategoryCard({
  category,
  siteSlug,
  productCount,
}: CategoryCardProps) {
  const categoryUrl = `/${siteSlug}/categories/${category.slug}`

  return (
    <Link
      href={categoryUrl}
      className={cn(
        'group flex items-center gap-4 p-4',
        'rounded-xl border border-border/50 bg-card',
        'transition-all duration-200',
        'hover:border-border hover:shadow-md'
      )}
    >
      {category.featuredImage ? (
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={category.featuredImage}
            alt={category.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      ) : (
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-[var(--site-primary-10)]"
          style={
            {
              '--site-primary-10': 'color-mix(in srgb, var(--site-primary) 10%, transparent)',
            } as React.CSSProperties
          }
        >
          {category.icon ? (
            <span className="text-xl">{category.icon}</span>
          ) : (
            <span className="text-lg font-semibold text-muted-foreground transition-colors group-hover:text-[var(--site-primary)]">
              {category.name.charAt(0)}
            </span>
          )}
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-medium text-foreground transition-colors group-hover:text-[var(--site-primary)]">
          {category.name}
        </h3>
        <p className="text-sm text-muted-foreground">{productCount} products</p>
      </div>
      <svg
        className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  )
}
