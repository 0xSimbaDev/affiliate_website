/**
 * ArticleCard Component
 *
 * Displays an article in card format for listings and grids.
 * Supports multiple variants: default, featured, and compact.
 */

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '../ui/badge'
import { getArticleUrlWithCategory } from '@affiliate/utils'
import type { ArticleCardData, ContentSlugType, ArticleType } from '@affiliate/types'

interface ArticleCardProps {
  article: ArticleCardData
  siteSlug: string
  contentSlug: ContentSlugType
  variant?: 'default' | 'featured' | 'compact'
  showCategory?: boolean
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

function formatDate(date: Date | null): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export default function ArticleCard({
  article,
  siteSlug,
  contentSlug,
  variant = 'default',
  showCategory = true,
  className = '',
}: ArticleCardProps) {
  const articleUrl = getArticleUrlWithCategory(
    siteSlug,
    article.slug,
    contentSlug,
    article.articleCategory?.slug
  )

  if (variant === 'compact') {
    return (
      <Link
        href={articleUrl}
        className={`group flex gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-[var(--site-primary)] ${className}`}
      >
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
              <svg className="h-8 w-8 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Badge variant="secondary" className={`mb-1 text-xs ${articleTypeColors[article.articleType]}`}>
            {articleTypeLabels[article.articleType]}
          </Badge>
          <h4 className="line-clamp-2 font-medium group-hover:text-[var(--site-primary)]">
            {article.title}
          </h4>
          {article.publishedAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(article.publishedAt)}
            </p>
          )}
        </div>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link
        href={articleUrl}
        className={`group relative block overflow-hidden rounded-xl bg-card ${className}`}
      >
        {/* Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          {article.featuredImage ? (
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg className="h-16 w-16 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Content overlay */}
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className={`${articleTypeColors[article.articleType]} border-0`}>
                {articleTypeLabels[article.articleType]}
              </Badge>
              {showCategory && article.articleCategory && (
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  {article.articleCategory.name}
                </Badge>
              )}
              {article.isFeatured && (
                <Badge className="bg-yellow-500 text-yellow-950 hover:bg-yellow-500">
                  Featured
                </Badge>
              )}
            </div>

            <h2 className="mb-2 text-2xl font-bold leading-tight md:text-3xl lg:text-4xl">
              {article.title}
            </h2>

            {article.excerpt && (
              <p className="mb-3 line-clamp-2 text-sm text-white/80 md:text-base">
                {article.excerpt}
              </p>
            )}

            <div className="flex items-center gap-3 text-sm text-white/70">
              {article.author && <span>{article.author}</span>}
              {article.author && article.publishedAt && <span>•</span>}
              {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Default variant
  return (
    <Link
      href={articleUrl}
      className={`group block overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-[var(--site-primary)] ${className}`}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-12 w-12 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Featured badge overlay */}
        {article.isFeatured && (
          <div className="absolute right-3 top-3">
            <Badge className="bg-yellow-500 text-yellow-950 hover:bg-yellow-500">
              Featured
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className={`text-xs ${articleTypeColors[article.articleType]}`}>
            {articleTypeLabels[article.articleType]}
          </Badge>
          {showCategory && article.articleCategory && (
            <Badge variant="outline" className="text-xs">
              {article.articleCategory.name}
            </Badge>
          )}
        </div>

        <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-tight group-hover:text-[var(--site-primary)]">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {article.author && <span>{article.author}</span>}
          {article.author && article.publishedAt && <span>•</span>}
          {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
          {article.productCount !== undefined && article.productCount > 0 && (
            <>
              <span>•</span>
              <span>{article.productCount} products</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
