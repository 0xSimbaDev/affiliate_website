/**
 * Product Page Layout Utilities
 *
 * Helper functions for preparing product page context data.
 */

import type { SiteWithNiche, ContentSlugType, ProductWithCategories, AffiliateLink, ProductCardData } from '@/lib/types'
import type { ArticleWithProductContext } from '@/lib/api/articles'
import type {
  ProductPageContextData,
  ProductMetadata,
  BreadcrumbItem,
  FormattedPrice,
} from './types'
import { buildCanonicalUrl } from '@/lib/utils/seo'
import { getPrimaryCTA } from '@/components/products/ProductCTA'

/**
 * Format price for display.
 */
function formatPrice(price: number | string | null, currency: string | null): string | null {
  if (price === null) return null

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
 * Build context data for the product page.
 *
 * @param site - Site with niche data
 * @param product - Full product data
 * @param relatedProducts - Related products for the section
 * @param featuredArticles - Articles featuring this product
 * @returns Context data for ProductPageProvider
 */
export function buildProductPageContext(
  site: SiteWithNiche,
  product: ProductWithCategories,
  relatedProducts: ProductCardData[],
  featuredArticles: ArticleWithProductContext[]
): ProductPageContextData {
  const siteSlug = site.slug
  const nicheSlug = site.niche?.slug ?? null
  const contentSlug = site.contentSlug as ContentSlugType

  // Parse affiliate links
  const affiliateLinks: AffiliateLink[] = Array.isArray(product.affiliateLinks)
    ? product.affiliateLinks
    : []

  // Get primary partner
  const primaryLink = affiliateLinks.find((l) => l.isPrimary) || affiliateLinks[0]
  const primaryPartner = primaryLink?.partner

  // Build URLs
  const baseUrl = buildCanonicalUrl(site, '')
  const productUrl = buildCanonicalUrl(site, `/products/${product.slug}`)

  // Prepare gallery images
  const allImages = [
    ...(product.featuredImage ? [product.featuredImage] : []),
    ...(product.galleryImages || []),
  ]

  // Format prices
  const formattedPrice = formatPrice(product.priceFrom, product.priceCurrency)
  const formattedPriceTo = product.priceTo
    ? formatPrice(product.priceTo, product.priceCurrency)
    : null

  const price: FormattedPrice = {
    primary: formattedPrice,
    secondary: formattedPriceTo,
    text: product.priceText,
  }

  // Get metadata
  const metadata = (product.metadata as ProductMetadata) || {}

  // Get rating as number
  const rating =
    product.rating !== null
      ? typeof product.rating === 'string'
        ? parseFloat(product.rating)
        : Number(product.rating)
      : null

  // Primary category
  const primaryCategoryRelation =
    product.categories?.find((c) => c.isPrimary)?.category ||
    product.categories?.[0]?.category

  const primaryCategory = primaryCategoryRelation
    ? {
        id: primaryCategoryRelation.id,
        slug: primaryCategoryRelation.slug,
        name: primaryCategoryRelation.name,
      }
    : null

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
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

  // Get niche-specific CTA text
  const ctaText = getPrimaryCTA(nicheSlug)

  return {
    // Site data
    site,
    siteSlug,
    contentSlug,
    nicheSlug,

    // Product data
    product,
    metadata,

    // Computed values
    rating,
    price,
    allImages,
    breadcrumbItems,

    // Affiliate data
    affiliateLinks,
    primaryPartner,
    ctaText,

    // URLs
    baseUrl,
    productUrl,

    // Primary category
    primaryCategory,

    // Related data
    relatedProducts,
    featuredArticles,
  }
}
