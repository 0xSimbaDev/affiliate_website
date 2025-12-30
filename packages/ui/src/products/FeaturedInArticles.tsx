/**
 * FeaturedInArticles Component
 *
 * Displays articles that feature a specific product.
 * Used on product detail pages for internal linking and content discovery.
 */

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '../ui/badge'
import { getArticleUrlWithCategory } from '@affiliate/utils'
import type { ArticleWithProductContext } from '@affiliate/api'
import type { ContentSlugType, ArticleType } from '@affiliate/types'

interface FeaturedInArticlesProps {
  articles: ArticleWithProductContext[]
  siteSlug: string
  contentSlug: ContentSlugType
  className?: string
}

const articleTypeLabels: Record<ArticleType, string> = {
  ROUNDUP: 'Roundup',
  REVIEW: 'Review',
  COMPARISON: 'Comparison',
  BUYING_GUIDE: 'Buying Guide',
  HOW_TO: 'How To',
}

const articleTypeColors: Record<ArticleType, string> = {
  ROUNDUP: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  REVIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  COMPARISON: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  BUYING_GUIDE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  HOW_TO: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
}

export default function FeaturedInArticles({
  articles,
  siteSlug,
  contentSlug,
  className = '',
}: FeaturedInArticlesProps) {
  if (articles.length === 0) {
    return null
  }

  return (
    <section className={className}>
      <h2 className="mb-4 text-xl font-semibold">Featured In</h2>
      <div className="space-y-3">
        {articles.map((article) => {
          const articleUrl = getArticleUrlWithCategory(
            siteSlug,
            article.slug,
            contentSlug,
            article.articleCategory?.slug
          )

          return (
            <Link
              key={article.id}
              href={articleUrl}
              className="group flex gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-[var(--site-primary)]"
            >
              {/* Thumbnail */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {article.featuredImage ? (
                  <Image
                    src={article.featuredImage}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <svg
                      className="h-8 w-8 text-muted-foreground/30"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  {/* Article Type Badge */}
                  <Badge
                    variant="secondary"
                    className={`text-xs ${articleTypeColors[article.articleType]}`}
                  >
                    {articleTypeLabels[article.articleType]}
                  </Badge>

                  {/* Highlight Badge (e.g., "Best Overall", "#1 Pick") */}
                  {article.highlight && (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">
                      {article.highlight}
                    </Badge>
                  )}
                </div>

                <h3 className="line-clamp-2 font-medium group-hover:text-[var(--site-primary)]">
                  {article.title}
                </h3>

                {article.excerpt && (
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {article.excerpt}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <div className="hidden sm:flex items-center">
                <svg
                  className="h-5 w-5 text-muted-foreground group-hover:text-[var(--site-primary)] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export { FeaturedInArticles }
