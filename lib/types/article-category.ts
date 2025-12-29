/**
 * Article Category Type Definitions
 *
 * Defines the structure for article categories (separate from product categories).
 * Article categories organize content by type: Buying Guides, Reviews, How-To, etc.
 */

/**
 * Base ArticleCategory type matching Prisma ArticleCategory model.
 */
export interface ArticleCategory {
  /** Unique identifier */
  id: string
  /** Reference to parent site */
  siteId: string
  /** Parent category ID for hierarchy */
  parentId: string | null
  /** URL-safe slug */
  slug: string
  /** Category name */
  name: string
  /** Category description */
  description: string | null
  /** Icon identifier */
  icon: string | null
  /** Featured image URL */
  featuredImage: string | null
  /** SEO title tag */
  seoTitle: string | null
  /** SEO meta description */
  seoDescription: string | null
  /** Whether category is active */
  isActive: boolean
  /** Sort order for listings */
  sortOrder: number
  /** Creation timestamp */
  createdAt: Date
  /** Last update timestamp */
  updatedAt: Date
}

/**
 * ArticleCategory with its child categories.
 * Used for navigation and hierarchical displays.
 */
export interface ArticleCategoryWithChildren extends ArticleCategory {
  /** Child categories */
  children: ArticleCategory[]
  /** Article count */
  _count?: { articles: number }
}

/**
 * ArticleCategory with its parent category.
 * Used for breadcrumbs and context.
 */
export interface ArticleCategoryWithParent extends ArticleCategory {
  /** Parent category (if any) */
  parent: ArticleCategoryReference | null
  /** Article count */
  _count?: { articles: number }
}

/**
 * ArticleCategory with both parent and children.
 * Full hierarchical context.
 */
export interface ArticleCategoryWithHierarchy extends ArticleCategory {
  /** Parent category (if any) */
  parent: ArticleCategoryReference | null
  /** Child categories */
  children: ArticleCategory[]
  /** Article count */
  _count?: { articles: number }
}

/**
 * Minimal article category reference for listings and relations.
 * Used in article cards and dropdowns.
 */
export interface ArticleCategoryReference {
  /** Unique identifier */
  id: string
  /** URL-safe slug */
  slug: string
  /** Category name */
  name: string
  /** Category description */
  description?: string | null
  /** Article count */
  _count?: { articles: number }
}

/**
 * ArticleCategory for navigation menus.
 * Includes minimal fields plus children.
 */
export interface ArticleCategoryNavItem {
  /** Unique identifier */
  id: string
  /** URL-safe slug */
  slug: string
  /** Category name */
  name: string
  /** Icon identifier */
  icon: string | null
  /** Nested children for submenus */
  children: ArticleCategoryNavItem[]
}

/**
 * Options for querying article categories.
 */
export interface ArticleCategoryQueryOptions {
  /** Filter by parent ID (null for root categories) */
  parentId?: string | null
  /** Filter active categories only */
  isActive?: boolean
  /** Include children in response */
  includeChildren?: boolean
  /** Include parent in response */
  includeParent?: boolean
  /** Only include categories with published articles */
  withArticles?: boolean
  /** Sort field */
  sortBy?: 'name' | 'sortOrder' | 'createdAt'
  /** Sort direction */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Input type for creating a new article category.
 */
export interface ArticleCategoryInput {
  siteId: string
  parentId?: string | null
  slug: string
  name: string
  description?: string | null
  icon?: string | null
  featuredImage?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  isActive?: boolean
  sortOrder?: number
}
