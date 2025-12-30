/**
 * Category Type Definitions
 *
 * Defines the structure for categories across all niches.
 * Categories organize products and can be hierarchical.
 */

/**
 * Base Category type matching Prisma Category model.
 */
export interface Category {
  /** Unique identifier */
  id: string
  /** Reference to parent site */
  siteId: string
  /** Category type slug (defined in niche config) */
  categoryType: string
  /** Parent category ID for hierarchy */
  parentId: string | null
  /** URL-safe slug */
  slug: string
  /** Category name */
  name: string
  /** Category description */
  description: string | null
  /** Full content (markdown/HTML) */
  content: string | null
  /** Icon identifier */
  icon: string | null
  /** Featured image URL */
  featuredImage: string | null
  /** SEO title tag */
  seoTitle: string | null
  /** SEO meta description */
  seoDescription: string | null
  /** SEO keywords */
  seoKeywords: string[]
  /** Flexible metadata storage */
  metadata: Record<string, unknown> | null
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
 * Category with its child categories.
 * Used for navigation and hierarchical displays.
 */
export interface CategoryWithChildren extends Category {
  /** Child categories */
  children: Category[]
}

/**
 * Category with its parent category.
 * Used for breadcrumbs and context.
 */
export interface CategoryWithParent extends Category {
  /** Parent category (if any) */
  parent: Category | null
}

/**
 * Category with both parent and children.
 * Full hierarchical context.
 */
export interface CategoryWithHierarchy extends Category {
  /** Parent category (if any) */
  parent: Category | null
  /** Child categories */
  children: Category[]
}

/**
 * Minimal category reference for listings and relations.
 * Used in product cards and dropdowns.
 */
export interface CategoryReference {
  /** Unique identifier */
  id: string
  /** URL-safe slug */
  slug: string
  /** Category name */
  name: string
  /** Category type slug */
  categoryType: string
}

/**
 * Category for navigation menus.
 * Includes minimal fields plus children.
 */
export interface CategoryNavItem {
  /** Unique identifier */
  id: string
  /** URL-safe slug */
  slug: string
  /** Category name */
  name: string
  /** Category type slug */
  categoryType: string
  /** Icon identifier */
  icon: string | null
  /** Nested children for submenus */
  children: CategoryNavItem[]
}

/**
 * Options for querying categories.
 */
export interface CategoryQueryOptions {
  /** Filter by category type slug */
  categoryType?: string
  /** Filter by parent ID (null for root categories) */
  parentId?: string | null
  /** Filter active categories only */
  isActive?: boolean
  /** Include children in response */
  includeChildren?: boolean
  /** Include parent in response */
  includeParent?: boolean
  /** Maximum depth of children to include */
  childDepth?: number
  /** Sort field */
  sortBy?: 'name' | 'sortOrder' | 'createdAt'
  /** Sort direction */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Input type for creating a new category.
 */
export interface CategoryInput {
  siteId: string
  categoryType: string
  parentId?: string | null
  slug: string
  name: string
  description?: string | null
  content?: string | null
  icon?: string | null
  featuredImage?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string[]
  metadata?: Record<string, unknown> | null
  isActive?: boolean
  sortOrder?: number
}
