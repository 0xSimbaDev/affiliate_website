/**
 * CategoryHeader Component
 *
 * Header section for category-filtered article pages.
 * Shows category name, description, article count, and breadcrumb.
 */

import Link from 'next/link'
import { Badge } from '@affiliate/ui/ui/badge'
import type { ContentSlugType } from '@affiliate/types'
import { getContentNavLabel } from '@affiliate/utils'

interface CategoryHeaderProps {
  category: {
    name: string
    description: string | null
    slug: string
  }
  articleCount: number
  siteSlug: string
  contentSlug: ContentSlugType
  className?: string
}

export default function CategoryHeader({
  category,
  articleCount,
  siteSlug,
  contentSlug,
  className = '',
}: CategoryHeaderProps) {
  return (
    <header className={`mb-8 lg:mb-12 ${className}`}>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/${siteSlug}`} className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href={`/${siteSlug}/${contentSlug}`} className="hover:text-foreground">
          {getContentNavLabel(contentSlug)}
        </Link>
        <span>/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>

      {/* Category Title */}
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {category.name}
        </h1>
        <Badge variant="secondary" className="text-sm">
          {articleCount} {articleCount === 1 ? 'article' : 'articles'}
        </Badge>
      </div>

      {/* Description */}
      {category.description && (
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          {category.description}
        </p>
      )}
    </header>
  )
}
