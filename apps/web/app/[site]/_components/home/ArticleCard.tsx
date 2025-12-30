/**
 * Article Card Component
 *
 * Card for displaying articles/reviews on the homepage.
 * Shows featured image, title, excerpt, and metadata.
 */

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@affiliate/utils'
import type { ArticleCardData } from '@affiliate/types'

interface ArticleCardProps {
  /** Article data to display */
  article: ArticleCardData
  /** Site slug for URL generation */
  siteSlug: string
  /** Content section slug (e.g., 'reviews', 'articles') */
  contentSlug: string
  /** Whether to render as a featured/large card */
  isFeatured?: boolean
}

/**
 * Format a date for display
 */
function formatDate(date: Date | null): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

/**
 * Get human-readable article type label
 */
function getArticleTypeLabel(articleType: string): string {
  const labels: Record<string, string> = {
    ROUNDUP: 'Roundup',
    REVIEW: 'Review',
    COMPARISON: 'Comparison',
    BUYING_GUIDE: 'Buying Guide',
    HOW_TO: 'How-To',
  }
  return labels[articleType] || articleType
}

export function ArticleCard({
  article,
  siteSlug,
  contentSlug,
  isFeatured = false,
}: ArticleCardProps) {
  const articleUrl = `/${siteSlug}/${contentSlug}/${article.slug}`

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border/50 bg-card',
        'transition-all duration-200 hover:border-border hover:shadow-lg',
        isFeatured && 'lg:col-span-2'
      )}
    >
      <Link href={articleUrl} className="block h-full">
        {/* Image Area */}
        <div
          className={cn(
            'relative bg-gradient-to-br from-muted to-muted/50',
            isFeatured ? 'aspect-[16/9]' : 'aspect-[16/10]'
          )}
        >
          {article.featuredImage ? (
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={isFeatured ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className={cn(
                  'text-muted-foreground/20',
                  isFeatured ? 'h-20 w-20' : 'h-12 w-12'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={0.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
          )}

          {/* Article Type Badge */}
          <div
            className="absolute left-3 top-3 rounded-md px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: 'var(--site-primary)' }}
          >
            {getArticleTypeLabel(article.articleType)}
          </div>
        </div>

        {/* Content */}
        <div className={cn('p-5', isFeatured && 'lg:p-6')}>
          {/* Category/Metadata */}
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            {article.articleCategory && (
              <>
                <span>{article.articleCategory.name}</span>
                <span>-</span>
              </>
            )}
            {article.publishedAt && (
              <time dateTime={new Date(article.publishedAt).toISOString()}>
                {formatDate(article.publishedAt)}
              </time>
            )}
          </div>

          <h3
            className={cn(
              'mb-2 font-semibold text-foreground transition-colors group-hover:text-[var(--site-primary)]',
              isFeatured ? 'text-xl lg:text-2xl' : 'text-lg'
            )}
          >
            {article.title}
          </h3>

          {article.excerpt && (
            <p
              className={cn(
                'text-muted-foreground',
                isFeatured ? 'line-clamp-3 text-sm lg:text-base' : 'line-clamp-2 text-sm'
              )}
            >
              {article.excerpt}
            </p>
          )}

          {/* Author and Read More */}
          <div className="mt-4 flex items-center justify-between">
            {article.author && (
              <span className="text-sm text-muted-foreground">
                By {article.author}
              </span>
            )}
            <div className="flex items-center gap-1.5 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
              <span style={{ color: 'var(--site-primary)' }}>Read More</span>
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
        </div>
      </Link>
    </article>
  )
}
