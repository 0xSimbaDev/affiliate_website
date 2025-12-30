/**
 * Catch-All Route Handler
 *
 * Handles all sub-routes under /[site]/[contentSlug]:
 * - /[site]/[contentSlug]/[slug] - Category page OR Article detail (disambiguation)
 * - /[site]/[contentSlug]/[categorySlug]/[articleSlug] - Article with category context
 */

import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getSiteBySlug,
  getArticleCategoryBySlug,
  getArticlesByCategorySlug,
  getArticleBySlug,
  getProductsBySlugs,
  getProductsByCategorySlug,
  getSidebarProducts,
  getAllCategoriesForAutoLink,
  getRelatedArticles,
} from '@affiliate/api'
import { BreadcrumbJsonLd, ArticleJsonLd, FAQJsonLd } from '@affiliate/ui/seo'
import { AffiliateDisclosure, AffiliateLink } from '@affiliate/ui/affiliate'
import { ContentRenderer, ArticleCard } from '@affiliate/ui/articles'
import { Button } from '@affiliate/ui/ui/button'
import { Badge } from '@affiliate/ui/ui/badge'
import {
  buildCanonicalUrl,
  getTwitterHandle,
  getContentSectionTitle,
  getArticleSchemaType,
} from '@affiliate/utils'
import { extractShortcodeReferences, extractHeadings } from '@affiliate/utils/content-parser'
import { VALID_CONTENT_SLUGS } from '@affiliate/types'
import { ArticleGrid, ArticleGridSkeleton, CategoryHeader } from '../_components'
import type { Metadata } from 'next'
import type { ArticleType, ContentSlugType, ProductCardData } from '@affiliate/types'

// =============================================================================
// Types
// =============================================================================

interface CatchAllPageProps {
  params: Promise<{
    site: string
    contentSlug: string
    slug: string[]
  }>
  searchParams: Promise<{
    page?: string
  }>
}

// =============================================================================
// Helper Functions
// =============================================================================

const articleTypeLabels: Record<ArticleType, string> = {
  ROUNDUP: 'Roundup',
  REVIEW: 'Review',
  COMPARISON: 'Comparison',
  BUYING_GUIDE: 'Buying Guide',
  HOW_TO: 'How To',
}

function formatDate(date: Date | null): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function formatPrice(price: number | null, currency: string | null): string {
  if (price === null) return ''
  const currencyCode = currency || 'USD'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  } catch {
    return `$${price}`
  }
}

// =============================================================================
// Metadata
// =============================================================================

export async function generateMetadata({
  params,
}: CatchAllPageProps): Promise<Metadata> {
  const { site: siteSlug, contentSlug, slug } = await params
  const site = await getSiteBySlug(siteSlug)

  if (!site) {
    return { title: 'Not Found' }
  }

  const siteContentSlug = (site as { contentSlug?: string }).contentSlug || 'reviews'
  if (contentSlug !== siteContentSlug) {
    return { title: 'Not Found' }
  }

  const twitterHandle = getTwitterHandle(site.social as Record<string, unknown> | null)

  // Two segments: [categorySlug, articleSlug]
  if (slug.length === 2) {
    const [, articleSlug] = slug
    const article = await getArticleBySlug(site.id, articleSlug)

    if (!article) {
      return { title: 'Article Not Found' }
    }

    const title = article.seoTitle || `${article.title} | ${site.name}`
    const description = article.seoDescription || article.excerpt || undefined
    const canonicalUrl = buildCanonicalUrl(site, `/${contentSlug}/${slug.join('/')}`)

    return {
      title,
      description,
      keywords: article.seoKeywords?.length ? article.seoKeywords : undefined,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: article.seoTitle || article.title,
        description: article.seoDescription || article.excerpt || undefined,
        url: canonicalUrl,
        siteName: site.name,
        type: 'article',
        images: article.featuredImage
          ? [{ url: article.featuredImage, width: 1200, height: 630, alt: article.title }]
          : undefined,
        publishedTime: article.publishedAt?.toISOString(),
        modifiedTime: article.updatedAt?.toISOString(),
        authors: article.author ? [article.author] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: article.seoTitle || article.title,
        description: article.seoDescription || article.excerpt || undefined,
        images: article.featuredImage ? [article.featuredImage] : undefined,
        ...(twitterHandle && { site: twitterHandle }),
      },
    }
  }

  // One segment: category or article
  if (slug.length === 1) {
    const singleSlug = slug[0]

    // Check if it's a category
    const category = await getArticleCategoryBySlug(site.id, singleSlug)
    if (category) {
      const title = `${category.name} | ${getContentSectionTitle(contentSlug as ContentSlugType)} | ${site.name}`
      const description = category.description || `Browse ${category.name} articles on ${site.name}`
      const canonicalUrl = buildCanonicalUrl(site, `/${contentSlug}/${singleSlug}`)

      return {
        title,
        description,
        alternates: { canonical: canonicalUrl },
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

    // Check if it's an article
    const article = await getArticleBySlug(site.id, singleSlug)
    if (article) {
      const title = article.seoTitle || `${article.title} | ${site.name}`
      const description = article.seoDescription || article.excerpt || undefined
      const canonicalUrl = buildCanonicalUrl(site, `/${contentSlug}/${singleSlug}`)

      return {
        title,
        description,
        keywords: article.seoKeywords?.length ? article.seoKeywords : undefined,
        alternates: { canonical: canonicalUrl },
        openGraph: {
          title: article.seoTitle || article.title,
          description: article.seoDescription || article.excerpt || undefined,
          url: canonicalUrl,
          siteName: site.name,
          type: 'article',
          images: article.featuredImage
            ? [{ url: article.featuredImage, width: 1200, height: 630, alt: article.title }]
            : undefined,
          publishedTime: article.publishedAt?.toISOString(),
          modifiedTime: article.updatedAt?.toISOString(),
          authors: article.author ? [article.author] : undefined,
        },
        twitter: {
          card: 'summary_large_image',
          title: article.seoTitle || article.title,
          description: article.seoDescription || article.excerpt || undefined,
          images: article.featuredImage ? [article.featuredImage] : undefined,
          ...(twitterHandle && { site: twitterHandle }),
        },
      }
    }
  }

  return { title: 'Not Found' }
}

// =============================================================================
// Category Page Component
// =============================================================================

async function CategoryPage({
  site,
  siteSlug,
  contentSlug,
  categorySlug,
  page,
}: {
  site: { id: string; name: string }
  siteSlug: string
  contentSlug: ContentSlugType
  categorySlug: string
  page: number
}) {
  const limit = 12
  const offset = (page - 1) * limit

  const { articles, total, category } = await getArticlesByCategorySlug(
    site.id,
    categorySlug,
    limit,
    offset
  )

  if (!category) {
    notFound()
  }

  const baseUrl = buildCanonicalUrl(site as Parameters<typeof buildCanonicalUrl>[0], '')

  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: getContentSectionTitle(contentSlug), url: `${baseUrl}/${contentSlug}` },
    { name: category.name, url: `${baseUrl}/${contentSlug}/${categorySlug}` },
  ]

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="min-h-screen pb-16">
        <div className="section-padding py-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            <CategoryHeader
              category={category}
              articleCount={total}
              siteSlug={siteSlug}
              contentSlug={contentSlug}
            />

            <Suspense fallback={<ArticleGridSkeleton count={6} />}>
              <ArticleGrid
                articles={articles}
                siteSlug={siteSlug}
                contentSlug={contentSlug}
                showCategory={false}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}

// =============================================================================
// Article Detail Component
// =============================================================================

async function ArticleDetailPage({
  site,
  siteSlug,
  contentSlug,
  articleSlug,
  categorySlug,
}: {
  site: { id: string; name: string }
  siteSlug: string
  contentSlug: ContentSlugType
  articleSlug: string
  categorySlug?: string
}) {
  // Validate category if provided
  let category: { name: string; slug: string; description: string | null } | null = null
  if (categorySlug) {
    category = await getArticleCategoryBySlug(site.id, categorySlug)
    if (!category) {
      notFound()
    }
  }

  // Fetch article
  const article = await getArticleBySlug(site.id, articleSlug)
  if (!article) {
    notFound()
  }

  // Use article's category if no categorySlug provided
  const displayCategory = category || article.articleCategory

  // Parse FAQs
  const faqs = article.faqs as Array<{ question: string; answer: string }> | null

  // Extract shortcode references and headings from content
  const shortcodeRefs = extractShortcodeReferences(article.content || '')
  const headings = extractHeadings(article.content || '')

  // Fetch products for shortcodes
  const [shortcodeProducts, allCategories] = await Promise.all([
    shortcodeRefs.productSlugs.length > 0
      ? getProductsBySlugs(site.id, shortcodeRefs.productSlugs)
      : Promise.resolve(new Map<string, ProductCardData>()),
    getAllCategoriesForAutoLink(site.id),
  ])

  // Fetch products for each category shortcode
  const categoryProductsMap = new Map<string, (ProductCardData & { primaryAffiliateUrl?: string | null })[]>()
  for (const catSlug of shortcodeRefs.categorySlugs) {
    const products = await getProductsByCategorySlug(site.id, catSlug, 6)
    categoryProductsMap.set(catSlug, products)
  }

  // Get article products
  const articleProductIds = article.products?.map((ap) => ap.product.id) || []
  const articleProducts = article.products?.map((ap) => ({
    ...ap.product,
    highlight: ap.highlight,
    position: ap.position,
    primaryAffiliateUrl: ap.product.primaryAffiliateUrl,
  })) || []

  // Get sidebar related products
  const sidebarProducts = await getSidebarProducts(site.id, {
    categoryId: article.categoryId || undefined,
    excludeIds: articleProductIds,
    limit: 4,
  })

  // Get related articles
  const relatedArticles = await getRelatedArticles(
    site.id,
    article.id,
    article.articleCategoryId,
    article.articleType,
    4
  )

  // Products for auto-linking
  const allProductsForAutoLink = [
    ...articleProducts.map((p) => ({ slug: p.slug, title: p.title })),
    ...Array.from(shortcodeProducts.values()).map((p) => ({ slug: p.slug, title: p.title })),
  ]

  // Build URLs
  const urlPath = categorySlug
    ? `/${contentSlug}/${categorySlug}/${articleSlug}`
    : `/${contentSlug}/${articleSlug}`
  const canonicalUrl = buildCanonicalUrl(site as Parameters<typeof buildCanonicalUrl>[0], urlPath)
  const baseUrl = buildCanonicalUrl(site as Parameters<typeof buildCanonicalUrl>[0], '')

  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: getContentSectionTitle(contentSlug), url: `${baseUrl}/${contentSlug}` },
    ...(displayCategory
      ? [{
          name: displayCategory.name,
          url: `${baseUrl}/${contentSlug}/${displayCategory.slug}`,
        }]
      : []),
    { name: article.title, url: canonicalUrl },
  ]

  const productsForSchema = article.products?.map((ap, index) => ({
    name: ap.product.title,
    url: `${baseUrl}/products/${ap.product.slug}`,
    position: index + 1,
    image: ap.product.featuredImage || undefined,
    description: ap.product.excerpt || undefined,
  })) || []

  return (
    <>
      {/* JSON-LD Structured Data */}
      <ArticleJsonLd
        schemaType={getArticleSchemaType(article.articleType)}
        headline={article.title}
        description={article.excerpt}
        image={article.featuredImage}
        author={article.author}
        publisher={site.name}
        url={canonicalUrl}
        datePublished={article.publishedAt?.toISOString()}
        dateModified={article.updatedAt?.toISOString()}
        products={productsForSchema.length > 0 ? productsForSchema : undefined}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {faqs && faqs.length > 0 && <FAQJsonLd faqs={faqs} />}

      <article className="min-h-screen pb-16">
        {/* Article Header - Full Width */}
        <header className="section-padding py-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {breadcrumbItems.map((item, index) => (
                <span key={item.url} className="flex items-center gap-2">
                  {index > 0 && <span>/</span>}
                  {index === breadcrumbItems.length - 1 ? (
                    <span className="text-foreground line-clamp-1">{item.name}</span>
                  ) : (
                    <Link
                      href={item.url.replace(baseUrl, `/${siteSlug}`)}
                      className="hover:text-foreground"
                    >
                      {item.name}
                    </Link>
                  )}
                </span>
              ))}
            </nav>

            {/* Badges */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {articleTypeLabels[article.articleType]}
              </Badge>
              {displayCategory && (
                <Badge variant="outline">
                  {displayCategory.name}
                </Badge>
              )}
              {article.isFeatured && (
                <Badge className="bg-yellow-500 text-yellow-950">Featured</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
                {article.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {article.author && <span>By {article.author}</span>}
              {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
              {article.products && article.products.length > 0 && (
                <span>{article.products.length} products reviewed</span>
              )}
            </div>

            {/* Featured Image */}
            {article.featuredImage && (
              <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1280px) 100vw, 1280px"
                />
              </div>
            )}
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="section-padding pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="article-layout">
              {/* Main Content */}
              <main className="min-w-0">
                {/* Affiliate Disclosure */}
                <AffiliateDisclosure className="mb-8" />

                {/* Article Content with Shortcode Support */}
                {article.content && (
                  <div className="mb-12">
                    <ContentRenderer
                      content={article.content}
                      siteSlug={siteSlug}
                      products={shortcodeProducts as Map<string, ProductCardData & { primaryAffiliateUrl?: string | null }>}
                      categoryProducts={categoryProductsMap}
                      allProducts={allProductsForAutoLink}
                      allCategories={allCategories}
                      enableAutoLink={true}
                    />
                  </div>
                )}

                {/* Product Cards (for roundups) */}
                {articleProducts.length > 0 && (
                  <section className="mb-12">
                    <h2 className="mb-6 text-2xl font-bold tracking-tight">
                      {article.articleType === 'ROUNDUP' ? 'Our Top Picks' : 'Featured Products'}
                    </h2>
                    <div className="space-y-6">
                      {articleProducts.map((product, index) => (
                        <div
                          key={product.id}
                          id={`product-${index + 1}`}
                          className="relative overflow-hidden rounded-xl border border-border bg-card"
                        >
                          {/* Position badge */}
                          <div
                            className="absolute left-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                            style={{ backgroundColor: 'var(--site-primary)' }}
                          >
                            {index + 1}
                          </div>

                          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-6">
                            {/* Product image */}
                            <Link
                              href={`/${siteSlug}/products/${product.slug}`}
                              className="relative mx-auto aspect-square w-full max-w-[200px] shrink-0 overflow-hidden rounded-lg bg-muted sm:mx-0"
                            >
                              {product.featuredImage ? (
                                <Image
                                  src={product.featuredImage}
                                  alt={product.title}
                                  fill
                                  className="object-cover transition-transform hover:scale-105"
                                  sizes="200px"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <svg className="h-12 w-12 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </Link>

                            {/* Product info */}
                            <div className="flex flex-1 flex-col justify-center text-center sm:text-left">
                              <Link href={`/${siteSlug}/products/${product.slug}`}>
                                <h3 className="text-lg font-semibold hover:text-[var(--site-primary)] sm:text-xl">
                                  {product.title}
                                </h3>
                              </Link>

                              {product.highlight && (
                                <p className="mt-2 text-sm font-medium text-[var(--site-primary)]">
                                  {product.highlight}
                                </p>
                              )}

                              {product.excerpt && (
                                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                  {product.excerpt}
                                </p>
                              )}

                              <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                                {product.priceFrom !== null && (
                                  <p className="text-2xl font-bold">
                                    {formatPrice(product.priceFrom, product.priceCurrency)}
                                  </p>
                                )}

                                <div className="flex items-center gap-3">
                                  {product.primaryAffiliateUrl && (
                                    <AffiliateLink href={product.primaryAffiliateUrl}>
                                      <Button
                                        style={{ backgroundColor: 'var(--site-primary)', color: 'white' }}
                                      >
                                        Check Price
                                        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                      </Button>
                                    </AffiliateLink>
                                  )}
                                  <Link
                                    href={`/${siteSlug}/products/${product.slug}`}
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                  >
                                    View Full Review
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* FAQs */}
                {faqs && faqs.length > 0 && (
                  <section className="mt-12 border-t border-border pt-12">
                    <h2 className="mb-6 text-2xl font-bold tracking-tight">
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-3">
                      {faqs.map((faq, index) => (
                        <details
                          key={index}
                          className="group rounded-lg border border-border bg-card"
                        >
                          <summary className="cursor-pointer p-4 font-medium hover:bg-accent/50">
                            {faq.question}
                          </summary>
                          <div className="border-t border-border p-4 text-muted-foreground">
                            {faq.answer}
                          </div>
                        </details>
                      ))}
                    </div>
                  </section>
                )}

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                  <section className="mt-12 border-t border-border pt-12">
                    <h2 className="mb-6 text-2xl font-bold tracking-tight">Related Articles</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {relatedArticles.map((relatedArticle) => (
                        <ArticleCard
                          key={relatedArticle.id}
                          article={relatedArticle}
                          siteSlug={siteSlug}
                          contentSlug={contentSlug}
                          variant="compact"
                        />
                      ))}
                    </div>
                  </section>
                )}
              </main>

              {/* Sidebar */}
              <aside className="article-sidebar">
                <div className="sticky top-24 space-y-6">
                  {/* Table of Contents */}
                  {headings.length > 0 && (
                    <div className="rounded-xl border border-border bg-card">
                      <div className="border-b border-border px-4 py-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Contents
                        </h3>
                      </div>
                      <nav className="p-4">
                        <ul className="space-y-2">
                          {headings.map((heading) => (
                            <li
                              key={heading.id}
                              className={heading.level === 3 ? 'ml-4' : ''}
                            >
                              <a
                                href={`#${heading.id}`}
                                className={`block text-sm text-muted-foreground hover:text-[var(--site-primary)] ${
                                  heading.level === 3 ? 'text-xs' : ''
                                }`}
                              >
                                {heading.text}
                              </a>
                            </li>
                          ))}
                          {articleProducts.length > 0 && (
                            <>
                              <li className="pt-2 border-t border-border mt-2">
                                <span className="block text-sm font-medium text-muted-foreground">
                                  Products
                                </span>
                              </li>
                              {articleProducts.map((product, index) => (
                                <li key={product.id} className="ml-4">
                                  <a
                                    href={`#product-${index + 1}`}
                                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-[var(--site-primary)]"
                                  >
                                    <span
                                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                      style={{ backgroundColor: 'var(--site-primary)' }}
                                    >
                                      {index + 1}
                                    </span>
                                    <span className="line-clamp-1">{product.title}</span>
                                  </a>
                                </li>
                              ))}
                            </>
                          )}
                        </ul>
                      </nav>
                    </div>
                  )}

                  {/* Featured Products */}
                  {articleProducts.length > 0 && (
                    <div className="rounded-xl border border-border bg-card">
                      <div className="border-b border-border px-4 py-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Top Picks
                        </h3>
                      </div>
                      <div className="divide-y divide-border">
                        {articleProducts.slice(0, 5).map((product, index) => (
                          <div key={product.id} className="p-4">
                            <div className="flex gap-3">
                              <div className="relative shrink-0">
                                <Link
                                  href={`/${siteSlug}/products/${product.slug}`}
                                  className="relative block h-16 w-16 overflow-hidden rounded-lg bg-muted"
                                >
                                  {product.featuredImage ? (
                                    <Image
                                      src={product.featuredImage}
                                      alt={product.title}
                                      fill
                                      className="object-cover"
                                      sizes="64px"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <svg className="h-6 w-6 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                </Link>
                                <div
                                  className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                  style={{ backgroundColor: 'var(--site-primary)' }}
                                >
                                  {index + 1}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <Link href={`/${siteSlug}/products/${product.slug}`}>
                                  <h4 className="text-sm font-medium leading-tight line-clamp-2 hover:text-[var(--site-primary)]">
                                    {product.title}
                                  </h4>
                                </Link>
                                <div className="mt-2 flex items-center justify-between gap-2">
                                  {product.priceFrom !== null && (
                                    <span className="text-sm font-bold">
                                      {formatPrice(product.priceFrom, product.priceCurrency)}
                                    </span>
                                  )}
                                  {product.primaryAffiliateUrl && (
                                    <AffiliateLink href={product.primaryAffiliateUrl}>
                                      <Button
                                        size="sm"
                                        className="h-7 text-xs"
                                        style={{ backgroundColor: 'var(--site-primary)', color: 'white' }}
                                      >
                                        Buy
                                      </Button>
                                    </AffiliateLink>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Products */}
                  {sidebarProducts.length > 0 && (
                    <div className="rounded-xl border border-border bg-card">
                      <div className="border-b border-border px-4 py-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          You May Also Like
                        </h3>
                      </div>
                      <div className="p-4 space-y-3">
                        {sidebarProducts.map((product) => (
                          <Link
                            key={product.id}
                            href={`/${siteSlug}/products/${product.slug}`}
                            className="flex items-center gap-3 text-sm hover:text-[var(--site-primary)]"
                          >
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                              {product.featuredImage ? (
                                <Image
                                  src={product.featuredImage}
                                  alt={product.title}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <svg className="h-4 w-4 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <span className="line-clamp-2">{product.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function CatchAllPage({ params, searchParams }: CatchAllPageProps) {
  const { site: siteSlug, contentSlug, slug } = await params
  const { page: pageParam } = await searchParams

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

  const page = Math.max(1, parseInt(pageParam || '1', 10))

  // Handle two segments: [categorySlug, articleSlug]
  if (slug.length === 2) {
    const [categorySlug, articleSlug] = slug
    return (
      <ArticleDetailPage
        site={site}
        siteSlug={siteSlug}
        contentSlug={contentSlug as ContentSlugType}
        articleSlug={articleSlug}
        categorySlug={categorySlug}
      />
    )
  }

  // Handle one segment: category or article
  if (slug.length === 1) {
    const singleSlug = slug[0]

    // 1. Check if slug is a category
    const category = await getArticleCategoryBySlug(site.id, singleSlug)
    if (category) {
      return (
        <CategoryPage
          site={site}
          siteSlug={siteSlug}
          contentSlug={contentSlug as ContentSlugType}
          categorySlug={singleSlug}
          page={page}
        />
      )
    }

    // 2. Check if slug is an article
    const article = await getArticleBySlug(site.id, singleSlug)
    if (article) {
      return (
        <ArticleDetailPage
          site={site}
          siteSlug={siteSlug}
          contentSlug={contentSlug as ContentSlugType}
          articleSlug={singleSlug}
        />
      )
    }
  }

  // No match found
  notFound()
}
