/**
 * ArticleGrid Component
 *
 * Responsive grid layout for article cards.
 * Supports 1, 2, or 3 columns based on viewport.
 */

import { ArticleCard } from '@affiliate/ui/articles'
import { Skeleton } from '@affiliate/ui/ui/skeleton'
import type { ArticleCardData, ContentSlugType } from '@affiliate/types'

interface ArticleGridProps {
  articles: ArticleCardData[]
  siteSlug: string
  contentSlug: ContentSlugType
  showCategory?: boolean
  className?: string
}

export default function ArticleGrid({
  articles,
  siteSlug,
  contentSlug,
  showCategory = true,
  className = '',
}: ArticleGridProps) {
  if (articles.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No articles found.</p>
      </div>
    )
  }

  return (
    <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          siteSlug={siteSlug}
          contentSlug={contentSlug}
          variant="default"
          showCategory={showCategory}
        />
      ))}
    </div>
  )
}

/**
 * Loading skeleton for ArticleGrid
 */
export function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
          <Skeleton className="aspect-[16/10] w-full" />
          <div className="p-4">
            <Skeleton className="mb-2 h-5 w-20" />
            <Skeleton className="mb-2 h-6 w-full" />
            <Skeleton className="mb-3 h-4 w-3/4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ))}
    </div>
  )
}
