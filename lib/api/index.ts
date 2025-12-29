/**
 * API Functions Barrel Export
 *
 * Re-exports all API data fetching functions for convenient importing.
 *
 * @example
 * import { getSiteBySlug, getProducts, getCategories } from '@/lib/api'
 */

// Site functions
export {
  getSiteBySlug,
  getSiteByDomain,
  getAllSites,
  getSitesByNiche,
} from './sites'

// Product functions
export {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getProductsByCategory,
  getRelatedProducts,
  getProductsBySlugs,
  getSidebarProducts,
  getProductsByCategorySlug,
} from './products'

// Category functions
export {
  getCategories,
  getCategoryBySlug,
  getRootCategories,
  getCategoryWithChildren,
  getCategoryReferences,
  getCategoryBreadcrumbs,
  getCategoriesBySlugs,
  getAllCategoriesForAutoLink,
} from './categories'

// Article functions
export {
  getArticles,
  getArticleBySlug,
  getFeaturedArticles,
  getRecentArticles,
  getArticlesByCategory,
  getArticlesByType,
  getRelatedArticles,
  incrementArticleViews,
  getArticleCategoryBySlug,
  getArticlesByCategorySlug,
  getArticleCategories,
} from './articles'
