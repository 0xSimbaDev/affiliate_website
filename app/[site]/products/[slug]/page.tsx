/**
 * Product Detail Page
 *
 * Thin orchestrator that uses the modular layout system.
 * Fetches data and delegates rendering to ProductPageLayout.
 */

import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getSiteBySlug } from '@/lib/api/sites'
import { getProductBySlug, getRelatedProducts } from '@/lib/api/products'
import { getArticlesByProductId } from '@/lib/api/articles'
import { buildCanonicalUrl } from '@/lib/utils/seo'

// SEO Components
import { ProductJsonLd } from '@/components/seo/ProductJsonLd'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

// Layout System
import {
  ProductPageLayout,
  buildProductPageContext,
  resolveLayoutConfig,
  type NicheLayoutConfig,
} from '@/lib/layouts/product'

// Types
interface PageProps {
  params: Promise<{ site: string; slug: string }>
}

/**
 * Generate static params for all product pages.
 * Fetches all sites and their published products for static generation.
 */
export async function generateStaticParams() {
  const { getAllSites } = await import('@/lib/api/sites')
  const { getProducts } = await import('@/lib/api/products')

  const sites = await getAllSites()
  const params: Array<{ site: string; slug: string }> = []

  for (const site of sites) {
    // Fetch all published products for this site
    const { products } = await getProducts(site.id, {
      status: 'PUBLISHED',
      limit: 1000, // Reasonable limit for static generation
    })

    // Add params for each product
    for (const product of products) {
      params.push({
        site: site.slug,
        slug: product.slug,
      })
    }
  }

  return params
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
 * Product Detail Page Component
 */
export default async function ProductPage({ params }: PageProps) {
  const { site, slug } = await params
  const siteData = await getSiteBySlug(site)

  if (!siteData) notFound()

  const product = await getProductBySlug(siteData.id, slug)

  if (!product) notFound()

  // Get related products and featured articles in parallel
  const [relatedProducts, featuredArticles] = await Promise.all([
    getRelatedProducts(siteData.id, product.id, product.productType, 4),
    getArticlesByProductId(siteData.id, product.id, 4),
  ])

  // Resolve layout configuration from niche or use default
  // Cast through unknown to handle Prisma's JsonValue type
  const nicheLayoutConfig = (siteData.niche as { layoutConfig?: NicheLayoutConfig | null })?.layoutConfig ?? null
  const layoutConfig = resolveLayoutConfig(nicheLayoutConfig)

  // Build context data for all sections
  const contextData = buildProductPageContext(
    siteData,
    product,
    relatedProducts,
    featuredArticles
  )

  // Prepare structured data
  const allImages = contextData.allImages
  const ratingValue = contextData.rating
  const productUrl = contextData.productUrl
  const breadcrumbItems = contextData.breadcrumbItems

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

      {/* Modular Layout */}
      <ProductPageLayout config={layoutConfig} contextData={contextData} />
    </>
  )
}
