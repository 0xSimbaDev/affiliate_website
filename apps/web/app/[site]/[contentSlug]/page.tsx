/**
 * Article Listing Page
 *
 * Magazine-style grid of articles with featured hero
 * and category filters.
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getSiteBySlug,
  getArticles,
  getFeaturedArticles,
  getArticleCategories,
  getArticleCategoryBySlug,
} from '@affiliate/api'
import { BreadcrumbJsonLd } from '@affiliate/ui/seo'
import {
  buildCanonicalUrl,
  getTwitterHandle,
  getContentSectionTitle,
  getContentSectionDescription,
} from '@affiliate/utils'
import { VALID_CONTENT_SLUGS } from '@affiliate/types'
import { ArticleHero, ArticleGrid, ArticleGridSkeleton, ArticleFilters } from './_components'
import type { Metadata } from 'next'
import type { ContentSlugType } from '@affiliate/types'

// =============================================================================
// Types
// =============================================================================

interface ArticleListingPageProps {
  params: Promise<{
    site: string
    contentSlug: string
  }>
  searchParams: Promise<{
    page?: string
    category?: string
  }>
}

// =============================================================================
// Metadata
// =============================================================================

export async function generateMetadata({
  params,
}: ArticleListingPageProps): Promise<Metadata> {
  const { site: siteSlug, contentSlug } = await params
  const site = await getSiteBySlug(siteSlug)

  if (!site) {
    return { title: 'Content Not Found' }
  }

  // Validate contentSlug matches site config
  const siteContentSlug = (site as { contentSlug?: string }).contentSlug || 'reviews'
  if (contentSlug !== siteContentSlug) {
    return { title: 'Content Not Found' }
  }

  const title = `${getContentSectionTitle(contentSlug as ContentSlugType)} | ${site.name}`
  const description = getContentSectionDescription(contentSlug as ContentSlugType)
  const canonicalUrl = buildCanonicalUrl(site, `/${contentSlug}`)
  const twitterHandle = getTwitterHandle(site.social as Record<string, unknown> | null)

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: site.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(twitterHandle && { site: twitterHandle }),
    },
  }
}

// =============================================================================
// Pagination Component
// =============================================================================

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  searchParams?: URLSearchParams
}

function Pagination({ currentPage, totalPages, basePath, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: (number | string)[] = []
  const showEllipsis = totalPages > 7

  if (showEllipsis) {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  } else {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  }

  function buildPageUrl(page: number) {
    const params = new URLSearchParams(searchParams)
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    const queryString = params.toString()
    return queryString ? `${basePath}?${queryString}` : basePath
  }

  return (
    <nav className="mt-12 flex items-center justify-center gap-2">
      {currentPage > 1 && (
        <Link
          href={buildPageUrl(currentPage - 1)}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
        >
          Previous
        </Link>
      )}

      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          typeof page === 'string' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
              {page}
            </span>
          ) : (
            <Link
              key={page}
              href={buildPageUrl(page)}
              className={`rounded-lg px-4 py-2 text-sm ${
                page === currentPage
                  ? 'bg-[var(--site-primary)] text-white'
                  : 'border border-border hover:bg-accent'
              }`}
            >
              {page}
            </Link>
          )
        )}
      </div>

      {currentPage < totalPages && (
        <Link
          href={buildPageUrl(currentPage + 1)}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
        >
          Next
        </Link>
      )}
    </nav>
  )
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function ArticleListingPage({
  params,
  searchParams,
}: ArticleListingPageProps) {
  const { site: siteSlug, contentSlug } = await params
  const {
    page: pageParam,
    category: categorySlug,
  } = await searchParams

  // Fetch site
  const site = await getSiteBySlug(siteSlug)
  if (!site) {
    notFound()
  }

  // Validate contentSlug
  const siteContentSlug = (site as { contentSlug?: string }).contentSlug || 'reviews'

  if (!VALID_CONTENT_SLUGS.includes(contentSlug as ContentSlugType)) {
    notFound()
  }

  if (contentSlug !== siteContentSlug) {
    notFound()
  }

  // Parse query params
  const page = Math.max(1, parseInt(pageParam || '1', 10))
  const limit = 12
  const offset = (page - 1) * limit

  // Look up article category by slug if provided
  let articleCategoryId: string | undefined
  if (categorySlug) {
    const articleCategory = await getArticleCategoryBySlug(site.id, categorySlug)
    if (articleCategory) {
      articleCategoryId = articleCategory.id
    }
    // If category slug doesn't exist, we'll show all articles (articleCategoryId remains undefined)
  }

  // Fetch data in parallel
  const [featuredArticles, categories, articlesResponse] = await Promise.all([
    // Only show featured hero if on first page and not filtering by category
    page === 1 && !articleCategoryId ? getFeaturedArticles(site.id, 1) : Promise.resolve([]),
    getArticleCategories(site.id),
    getArticles(site.id, {
      status: 'PUBLISHED',
      articleCategoryId,
      limit,
      offset,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    }),
  ])

  const { articles, total } = articlesResponse
  const totalPages = Math.ceil(total / limit)
  const heroArticle = featuredArticles[0]

  // Filter out hero article from grid if on first page
  const gridArticles = page === 1 && heroArticle
    ? articles.filter((a) => a.id !== heroArticle.id)
    : articles

  // Build URLs
  const baseUrl = buildCanonicalUrl(site, '')
  const basePath = `/${siteSlug}/${contentSlug}`

  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: getContentSectionTitle(contentSlug as ContentSlugType), url: `${baseUrl}/${contentSlug}` },
  ]

  // Build search params for pagination
  const paginationParams = new URLSearchParams()
  if (categorySlug) paginationParams.set('category', categorySlug)

  return (
    <>
      {/* JSON-LD Structured Data */}
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="min-h-screen pb-16">
        {/* Page Header */}
        <header className="section-padding py-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {getContentSectionTitle(contentSlug as ContentSlugType)}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              {getContentSectionDescription(contentSlug as ContentSlugType)}
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="section-padding">
          <div className="max-w-7xl mx-auto">
            {/* Hero Article (first page only) */}
            {page === 1 && heroArticle && (
              <ArticleHero
                article={heroArticle}
                siteSlug={siteSlug}
                contentSlug={contentSlug as ContentSlugType}
              />
            )}

            {/* Filters */}
            <Suspense fallback={<div className="h-20" />}>
              <ArticleFilters
                categories={categories}
                basePath={basePath}
                className="mb-8"
              />
            </Suspense>

            {/* Article Grid */}
            <Suspense fallback={<ArticleGridSkeleton count={6} />}>
              <ArticleGrid
                articles={gridArticles}
                siteSlug={siteSlug}
                contentSlug={contentSlug as ContentSlugType}
              />
            </Suspense>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath={basePath}
              searchParams={paginationParams}
            />
          </div>
        </div>
      </div>
    </>
  )
}
