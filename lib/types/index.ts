/**
 * Type Definitions Barrel Export
 *
 * Re-exports all type definitions for convenient importing.
 *
 * @example
 * import type { Product, Category, Article, NicheConfig } from '@/lib/types'
 */

// Niche types
export type {
  NicheConfig,
  NicheConfigInput,
  NicheLayoutConfigJson,
  ProductTypeDefinition,
  CategoryTypeDefinition,
  AffiliatePartner,
} from './niche'

// Site types
export type {
  Site,
  SiteWithNiche,
  SiteReference,
  SiteInput,
  SiteTheme,
  SiteSocial,
  ContentSlugType,
} from './site'

export { DEFAULT_CONTENT_SLUG, VALID_CONTENT_SLUGS } from './site'

// Product types
export type {
  Product,
  ProductWithCategories,
  ProductCardData,
  ProductCategoryRelation,
  ProductQueryOptions,
  ProductListResponse,
  ContentStatus,
  AffiliateLink,
  DecimalValue,
} from './product'

// Category types (for products)
export type {
  Category,
  CategoryWithChildren,
  CategoryWithParent,
  CategoryWithHierarchy,
  CategoryReference,
  CategoryNavItem,
  CategoryQueryOptions,
  CategoryInput,
} from './category'

// Article Category types (for articles - separate from product categories)
export type {
  ArticleCategory,
  ArticleCategoryWithChildren,
  ArticleCategoryWithParent,
  ArticleCategoryWithHierarchy,
  ArticleCategoryReference,
  ArticleCategoryNavItem,
  ArticleCategoryQueryOptions,
  ArticleCategoryInput,
} from './article-category'

// Article types
export type {
  Article,
  ArticleType,
  ArticleWithCategory,
  ArticleWithProducts,
  ArticleCardData,
  ArticleFAQ,
  ArticleProductReference,
  ArticleQueryOptions,
  ArticleListResponse,
  ArticleInput,
  ArticleProductInput,
} from './article'
