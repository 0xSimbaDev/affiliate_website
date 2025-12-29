/**
 * Product Detail Page
 *
 * Modern, minimalist product page with:
 * - Clean Apple/Stripe-inspired design
 * - SEO optimization with JSON-LD structured data
 * - Responsive layout with mobile sticky CTA
 * - Affiliate link integration
 */

import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { getSiteBySlug } from '@/lib/api/sites'
import { getProductBySlug, getRelatedProducts } from '@/lib/api/products'
import { buildCanonicalUrl } from '@/lib/utils/seo'
import { cn } from '@/lib/utils'

// SEO Components
import { ProductJsonLd } from '@/components/seo/ProductJsonLd'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

// Affiliate Components
import { AffiliateLink } from '@/components/affiliate/AffiliateLink'
import { AffiliateDisclosure } from '@/components/affiliate/AffiliateDisclosure'

// Shared Components
import { ProductCard } from '@/components/products/ProductCard'

// Local Components
import ImageGallery from './_components/ImageGallery'
import StickyBuyBar from './_components/StickyBuyBar'

// Types
interface PageProps {
  params: Promise<{ site: string; slug: string }>
}

// Type for product metadata
interface ProductMetadata {
  pros?: string[]
  cons?: string[]
  features?: string[]
  specifications?: Record<string, string>
  [key: string]: unknown
}

/**
 * Generate static params for all product pages
 */
export async function generateStaticParams() {
  // This would typically fetch all products from all sites
  // For now, return empty to use dynamic rendering
  return []
}

/**
 * Generate SEO metadata for the product page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { site, slug } = await params
  const siteData = await getSiteBySlug(site)

  if (!siteData) return {}

  const product = await getProductBySlug(siteData.id, slug)

  if (!product) return {}

  const canonicalUrl = buildCanonicalUrl(siteData, `/products/${slug}`)

  return {
    title: product.seoTitle || product.title,
    description: product.seoDescription || product.excerpt || undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: product.title,
      description: product.excerpt || undefined,
      type: 'website',
      url: canonicalUrl,
      siteName: siteData.name,
      images: product.featuredImage ? [{ url: product.featuredImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.excerpt || undefined,
      images: product.featuredImage ? [product.featuredImage] : undefined,
    },
  }
}

/**
 * Format price for display
 */
function formatPrice(price: number | string | null, currency: string | null): string {
  if (price === null) return ''

  const numericPrice = typeof price === 'string' ? parseFloat(price) : price
  const currencyCode = currency || 'USD'

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericPrice)
  } catch {
    return `$${numericPrice}`
  }
}

/**
 * Star Rating Component
 */
function StarRating({
  rating,
  reviewCount,
}: {
  rating: number
  reviewCount?: number | null
}) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div
      className="flex items-center gap-2"
      role="img"
      aria-label={`Rating: ${rating.toFixed(1)} out of 5 stars${reviewCount ? `, ${reviewCount} reviews` : ''}`}
    >
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
          const isFull = i < fullStars
          const isHalf = i === fullStars && hasHalfStar

          return (
            <svg
              key={i}
              className={cn(
                'w-5 h-5',
                isFull || isHalf ? 'text-amber-400' : 'text-muted-foreground/20'
              )}
              fill={isFull ? 'currentColor' : isHalf ? 'url(#half-star)' : 'currentColor'}
              viewBox="0 0 20 20"
            >
              {isHalf && (
                <defs>
                  <linearGradient id="half-star">
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              )}
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )
        })}
      </div>
      <span className="text-base font-semibold text-foreground">{rating.toFixed(1)}</span>
      {reviewCount && (
        <span className="text-sm text-muted-foreground">({reviewCount.toLocaleString()} reviews)</span>
      )}
    </div>
  )
}

/**
 * Pros/Cons List Component
 */
function ProsConsList({
  pros,
  cons,
}: {
  pros?: string[]
  cons?: string[]
}) {
  if ((!pros || pros.length === 0) && (!cons || cons.length === 0)) {
    return null
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Pros */}
      {pros && pros.length > 0 && (
        <div className="bg-green-50/50 dark:bg-green-950/20 rounded-2xl p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-4">
            What we like
          </h3>
          <ul className="space-y-3">
            {pros.map((pro, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm text-foreground leading-relaxed">{pro}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cons */}
      {cons && cons.length > 0 && (
        <div className="bg-red-50/50 dark:bg-red-950/20 rounded-2xl p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-red-700 dark:text-red-400 mb-4">
            What could be better
          </h3>
          <ul className="space-y-3">
            {cons.map((con, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="text-sm text-foreground leading-relaxed">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * Product Detail Page
 */
export default async function ProductPage({ params }: PageProps) {
  const { site, slug } = await params
  const siteData = await getSiteBySlug(site)

  if (!siteData) notFound()

  const product = await getProductBySlug(siteData.id, slug)

  if (!product) notFound()

  // Get related products
  const relatedProducts = await getRelatedProducts(
    siteData.id,
    product.id,
    product.productType,
    4
  )

  // Build URLs
  const baseUrl = buildCanonicalUrl(siteData, '')
  const productUrl = buildCanonicalUrl(siteData, `/products/${slug}`)

  // Prepare gallery images
  const allImages = [
    ...(product.featuredImage ? [product.featuredImage] : []),
    ...(product.galleryImages || []),
  ]

  // Format price
  const formattedPrice = formatPrice(product.priceFrom, product.priceCurrency)
  const formattedPriceTo = product.priceTo
    ? formatPrice(product.priceTo, product.priceCurrency)
    : null

  // Get metadata (pros, cons, features)
  const metadata = (product.metadata as ProductMetadata) || {}
  const pros = metadata.pros
  const cons = metadata.cons

  // Get rating as number
  const ratingValue =
    product.rating !== null
      ? typeof product.rating === 'string'
        ? parseFloat(product.rating)
        : Number(product.rating)
      : null

  // Primary category for breadcrumb
  const primaryCategory = product.categories?.find((c) => c.isPrimary)?.category ||
    product.categories?.[0]?.category

  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: 'Products', url: `${baseUrl}/products` },
    ...(primaryCategory
      ? [
          {
            name: primaryCategory.name,
            url: `${baseUrl}/categories/${primaryCategory.slug}`,
          },
        ]
      : []),
    { name: product.title, url: productUrl },
  ]

  return (
    <>
      {/* Structured Data */}
      <ProductJsonLd
        name={product.title}
        description={product.excerpt}
        image={allImages}
        url={productUrl}
        price={{
          amount: product.priceFrom !== null ? Number(product.priceFrom) : null,
          currency: product.priceCurrency,
        }}
        rating={
          ratingValue !== null
            ? {
                value: ratingValue,
                reviewCount: product.reviewCount,
              }
            : undefined
        }
        affiliateUrl={product.primaryAffiliateUrl}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <article className="min-h-screen pb-24 lg:pb-16">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="border-b border-border/50 bg-muted/30"
        >
          <div className="container-wide section-padding py-3">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto">
              {breadcrumbItems.map((item, index) => (
                <li key={item.url} className="flex items-center gap-2 whitespace-nowrap">
                  {index > 0 && (
                    <svg
                      className="w-4 h-4 text-muted-foreground/50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  )}
                  {index === breadcrumbItems.length - 1 ? (
                    <span className="text-foreground font-medium truncate max-w-[200px]">
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      href={item.url.replace(baseUrl, `/${site}`)}
                      className="hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container-wide section-padding py-8 lg:py-12">
          {/* Hero Section - Two Column Layout on Desktop */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12 lg:mb-16">
            {/* Image Gallery */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <ImageGallery images={allImages} alt={product.title} />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category Tag */}
              {primaryCategory && (
                <Link
                  href={`/${site}/categories/${primaryCategory.slug}`}
                  className={cn(
                    'inline-block text-xs font-semibold uppercase tracking-wider',
                    'hover:opacity-80 transition-opacity'
                  )}
                  style={{ color: 'var(--site-primary)' }}
                >
                  {primaryCategory.name}
                </Link>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {product.title}
              </h1>

              {/* Rating */}
              {ratingValue !== null && (
                <StarRating rating={ratingValue} reviewCount={product.reviewCount} />
              )}

              {/* Price */}
              {formattedPrice && (
                <div className="flex items-baseline gap-2">
                  {product.priceFrom !== null && !formattedPriceTo && (
                    <span className="text-sm text-muted-foreground">From</span>
                  )}
                  <span className="text-3xl font-bold text-foreground">
                    {formattedPrice}
                  </span>
                  {formattedPriceTo && (
                    <>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-3xl font-bold text-foreground">
                        {formattedPriceTo}
                      </span>
                    </>
                  )}
                  {product.priceText && (
                    <span className="text-sm text-muted-foreground">
                      {product.priceText}
                    </span>
                  )}
                </div>
              )}

              {/* CTA Button */}
              {product.primaryAffiliateUrl && (
                <AffiliateLink
                  href={product.primaryAffiliateUrl}
                  className={cn(
                    'inline-flex items-center justify-center gap-2',
                    'w-full sm:w-auto px-8 py-4 rounded-xl',
                    'text-base font-semibold text-white',
                    'bg-[var(--site-primary)] hover:bg-[var(--site-primary)]/90',
                    'shadow-lg shadow-[var(--site-primary)]/20',
                    'transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--site-primary)]'
                  )}
                >
                  Check Price
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                </AffiliateLink>
              )}

              {/* Affiliate Disclosure */}
              <AffiliateDisclosure variant="compact" />

              {/* Short Description */}
              {product.excerpt && (
                <p className="text-base text-muted-foreground leading-relaxed">
                  {product.excerpt}
                </p>
              )}

              {/* Description */}
              {product.description && (
                <p className="text-base text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>
          </div>

          {/* Pros & Cons Section */}
          <section className="mb-12 lg:mb-16">
            <ProsConsList pros={pros} cons={cons} />
          </section>

          {/* Full Review Content */}
          {product.content && (
            <section className="mb-12 lg:mb-16">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Full Review
                </h2>
                <div
                  className="prose prose-lg prose-slate dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.content }}
                />
              </div>
            </section>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  Related Products
                </h2>
                <Link
                  href={`/${site}/products`}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                    siteSlug={site}
                    variant="compact"
                    showAffiliateBadge={false}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </article>

      {/* Mobile Sticky Buy Bar */}
      {product.primaryAffiliateUrl && (
        <StickyBuyBar
          productName={product.title}
          price={formattedPrice || null}
          affiliateUrl={product.primaryAffiliateUrl}
        />
      )}
    </>
  )
}
