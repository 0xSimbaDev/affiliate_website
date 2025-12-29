/**
 * Article Type Definitions
 *
 * Defines the structure for articles/reviews across all sites.
 * Supports multiple content types: roundups, reviews, comparisons, buying guides, how-tos.
 */

import type { ContentStatus } from './product'
import type { CategoryReference } from './category'
import type { ArticleCategoryReference } from './article-category'

/**
 * Article content types.
 * Matches the ArticleType enum in Prisma schema.
 */
export type ArticleType = 'ROUNDUP' | 'REVIEW' | 'COMPARISON' | 'BUYING_GUIDE' | 'HOW_TO'

/**
 * FAQ item for articles.
 * Used for structured FAQ sections and schema markup.
 */
export interface ArticleFAQ {
  /** The question */
  question: string
  /** The answer (can include markdown/HTML) */
  answer: string
}

/**
 * Product reference within an article (for roundups/comparisons).
 */
export interface ArticleProductReference {
  /** Unique identifier */
  id: string
  /** Product ID */
  productId: string
  /** Position/order in the article */
  position: number
  /** Highlight text for this product in context */
  highlight: string | null
  /** Product details */
  product: {
    id: string
    slug: string
    title: string
    excerpt: string | null
    featuredImage: string | null
    priceFrom: number | null
    priceCurrency: string | null
    rating: number | null
    productType: string
    isFeatured: boolean
    primaryAffiliateUrl: string | null
  }
}

/**
 * Base Article type matching Prisma Article model.
 */
export interface Article {
  /** Unique identifier */
  id: string
  /** Reference to parent site */
  siteId: string
  /** Article category ID (content-type based) */
  articleCategoryId: string | null
  /** @deprecated Use articleCategoryId. Product category ID */
  categoryId: string | null
  /** Type of article content */
  articleType: ArticleType
  /** URL-safe slug */
  slug: string
  /** Article title */
  title: string
  /** Short excerpt/summary */
  excerpt: string | null
  /** Full content (markdown/HTML) */
  content: string | null
  /** Featured/hero image URL */
  featuredImage: string | null
  /** Array of FAQ objects */
  faqs: ArticleFAQ[] | null
  /** Author name */
  author: string | null
  /** SEO title tag */
  seoTitle: string | null
  /** SEO meta description */
  seoDescription: string | null
  /** SEO keywords */
  seoKeywords: string[]
  /** Publication status */
  status: ContentStatus
  /** Whether article is featured */
  isFeatured: boolean
  /** Publication date */
  publishedAt: Date | null
  /** View count for analytics */
  viewCount: number
  /** Creation timestamp */
  createdAt: Date
  /** Last update timestamp */
  updatedAt: Date
}

/**
 * Article with its article category relation.
 */
export interface ArticleWithCategory extends Article {
  /** The article category (content-type based) */
  articleCategory: ArticleCategoryReference | null
  /** @deprecated Use articleCategory. Product category */
  category: CategoryReference | null
}

/**
 * Article with category and products (full detail).
 */
export interface ArticleWithProducts extends ArticleWithCategory {
  /** Products referenced in this article */
  products: ArticleProductReference[]
}

/**
 * Minimal article data for card displays.
 * Used in listing pages and grids for performance.
 */
export interface ArticleCardData {
  /** Unique identifier */
  id: string
  /** URL-safe slug */
  slug: string
  /** Article title */
  title: string
  /** Short excerpt */
  excerpt: string | null
  /** Type of article content */
  articleType: ArticleType
  /** Featured image URL */
  featuredImage: string | null
  /** Author name */
  author: string | null
  /** Publication date */
  publishedAt: Date | null
  /** Whether article is featured */
  isFeatured: boolean
  /** Article category reference (content-type based) */
  articleCategory: ArticleCategoryReference | null
  /** @deprecated Use articleCategory. Product category reference */
  category: CategoryReference | null
  /** Number of products (for roundups) */
  productCount?: number
}

/**
 * Options for querying articles.
 */
export interface ArticleQueryOptions {
  /** Filter by article category ID */
  articleCategoryId?: string
  /** @deprecated Use articleCategoryId. Filter by product category ID */
  categoryId?: string
  /** Filter by article type */
  articleType?: ArticleType
  /** Filter by status */
  status?: ContentStatus
  /** Filter featured articles only */
  featured?: boolean
  /** Number of items per page */
  limit?: number
  /** Number of items to skip */
  offset?: number
  /** Sort field */
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title' | 'viewCount'
  /** Sort direction */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Paginated article response.
 */
export interface ArticleListResponse {
  /** Array of articles */
  articles: ArticleCardData[]
  /** Total count for pagination */
  total: number
  /** Current limit */
  limit: number
  /** Current offset */
  offset: number
  /** Whether there are more results */
  hasMore: boolean
}

/**
 * Input type for creating a new article.
 */
export interface ArticleInput {
  siteId: string
  articleCategoryId?: string | null
  /** @deprecated Use articleCategoryId */
  categoryId?: string | null
  articleType?: ArticleType
  slug: string
  title: string
  excerpt?: string | null
  content?: string | null
  featuredImage?: string | null
  faqs?: ArticleFAQ[] | null
  author?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string[]
  status?: ContentStatus
  isFeatured?: boolean
  publishedAt?: Date | null
}

/**
 * Input type for linking products to an article.
 */
export interface ArticleProductInput {
  articleId: string
  productId: string
  position?: number
  highlight?: string | null
}
