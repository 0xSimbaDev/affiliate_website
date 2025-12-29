/**
 * Product Type Definitions
 *
 * Defines the structure for products/services across all niches.
 * Products are the core monetizable entities with affiliate links.
 */

import type { CategoryReference } from './category'

/**
 * Decimal type for price/rating fields.
 * Uses string | number to work with Prisma's Decimal without runtime import.
 */
export type DecimalValue = string | number

/**
 * Content status enum matching Prisma ContentStatus.
 */
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

/**
 * Affiliate link object for tracking different partner links.
 */
export interface AffiliateLink {
  /** Partner slug (e.g., 'booking-com', 'amazon') */
  partner: string
  /** The affiliate URL */
  url: string
  /** Optional label for the link */
  label?: string
  /** Whether this is the primary link */
  isPrimary?: boolean
}

/**
 * Base Product type matching Prisma Product model.
 */
export interface Product {
  /** Unique identifier */
  id: string
  /** Reference to parent site */
  siteId: string
  /** Product type slug (defined in niche config) */
  productType: string
  /** URL-safe slug */
  slug: string
  /** Product title */
  title: string
  /** Short excerpt/summary */
  excerpt: string | null
  /** Brief description */
  description: string | null
  /** Full content (markdown/HTML) */
  content: string | null
  /** Featured/hero image URL */
  featuredImage: string | null
  /** Array of gallery image URLs */
  galleryImages: string[]
  /** Starting price */
  priceFrom: DecimalValue | null
  /** Maximum price (for ranges) */
  priceTo: DecimalValue | null
  /** Price currency code */
  priceCurrency: string | null
  /** Human-readable price text */
  priceText: string | null
  /** Average rating (0.00 to 5.00) */
  rating: DecimalValue | null
  /** Number of reviews */
  reviewCount: number | null
  /** Array of affiliate links */
  affiliateLinks: AffiliateLink[] | null
  /** Primary affiliate URL for quick access */
  primaryAffiliateUrl: string | null
  /** SEO title tag */
  seoTitle: string | null
  /** SEO meta description */
  seoDescription: string | null
  /** SEO keywords */
  seoKeywords: string[]
  /** Flexible metadata storage */
  metadata: Record<string, unknown> | null
  /** Publication status */
  status: ContentStatus
  /** Whether product is featured */
  isFeatured: boolean
  /** Whether product is active */
  isActive: boolean
  /** Sort order for listings */
  sortOrder: number
  /** Publication date */
  publishedAt: Date | null
  /** Creation timestamp */
  createdAt: Date
  /** Last update timestamp */
  updatedAt: Date
}

/**
 * Product category relation (from join table).
 */
export interface ProductCategoryRelation {
  /** Relation ID */
  id: string
  /** Product ID */
  productId: string
  /** Category ID */
  categoryId: string
  /** Whether this is the primary category */
  isPrimary: boolean
  /** Creation timestamp */
  createdAt: Date
  /** The related category */
  category: CategoryReference
}

/**
 * Product with its category relations.
 */
export interface ProductWithCategories extends Product {
  /** Categories this product belongs to */
  categories: ProductCategoryRelation[]
}

/**
 * Minimal product data for card displays.
 * Used in listing pages and grids for performance.
 */
export interface ProductCardData {
  /** Unique identifier */
  id: string
  /** URL-safe slug */
  slug: string
  /** Product title */
  title: string
  /** Short excerpt */
  excerpt: string | null
  /** Featured image URL */
  featuredImage: string | null
  /** Starting price (as number for display) */
  priceFrom: number | null
  /** Currency code */
  priceCurrency: string | null
  /** Average rating (as number for display) */
  rating: number | null
  /** Product type slug */
  productType: string
  /** Whether product is featured */
  isFeatured: boolean
}

/**
 * Options for querying products.
 */
export interface ProductQueryOptions {
  /** Filter by product type slug */
  productType?: string
  /** Filter featured products only */
  featured?: boolean
  /** Filter by status */
  status?: ContentStatus
  /** Filter active products only */
  isActive?: boolean
  /** Category ID to filter by */
  categoryId?: string
  /** Number of items per page */
  limit?: number
  /** Number of items to skip */
  offset?: number
  /** Sort field */
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'sortOrder' | 'rating'
  /** Sort direction */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Paginated product response.
 */
export interface ProductListResponse {
  /** Array of products */
  products: ProductCardData[]
  /** Total count for pagination */
  total: number
  /** Current limit */
  limit: number
  /** Current offset */
  offset: number
  /** Whether there are more results */
  hasMore: boolean
}
