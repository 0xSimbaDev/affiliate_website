/**
 * Content URL Utilities
 *
 * Helper functions for generating content section URLs based on site configuration.
 * Supports the dynamic content slug feature (reviews, articles, guides, blog).
 */

import { DEFAULT_CONTENT_SLUG } from '@affiliate/types'
import type { ContentSlugType } from '@affiliate/types'

/**
 * Generate the content section listing URL for a site.
 *
 * @param siteSlug - The site's URL slug
 * @param contentSlug - The site's configured content slug (defaults to 'reviews')
 * @returns The full path to the content listing page
 *
 * @example
 * getContentListUrl('my-site', 'articles') // '/my-site/articles'
 * getContentListUrl('my-site') // '/my-site/reviews'
 */
export function getContentListUrl(
  siteSlug: string,
  contentSlug: ContentSlugType = DEFAULT_CONTENT_SLUG
): string {
  return `/${siteSlug}/${contentSlug}`
}

/**
 * Generate the URL for a specific article/content item.
 *
 * @param siteSlug - The site's URL slug
 * @param articleSlug - The article's URL slug
 * @param contentSlug - The site's configured content slug (defaults to 'reviews')
 * @returns The full path to the article page
 *
 * @example
 * getArticleUrl('my-site', 'best-products-2024', 'articles') // '/my-site/articles/best-products-2024'
 * getArticleUrl('my-site', 'best-products-2024') // '/my-site/reviews/best-products-2024'
 */
export function getArticleUrl(
  siteSlug: string,
  articleSlug: string,
  contentSlug: ContentSlugType = DEFAULT_CONTENT_SLUG
): string {
  return `/${siteSlug}/${contentSlug}/${articleSlug}`
}

/**
 * Get human-readable title for the content section.
 *
 * @param contentSlug - The content slug type
 * @returns Human-readable title for the section
 *
 * @example
 * getContentSectionTitle('reviews') // 'Reviews & Buying Guides'
 * getContentSectionTitle('blog') // 'Blog'
 */
export function getContentSectionTitle(contentSlug: ContentSlugType): string {
  const titles: Record<ContentSlugType, string> = {
    reviews: 'Reviews & Buying Guides',
    articles: 'Articles',
    guides: 'Guides',
    blog: 'Blog',
  }
  return titles[contentSlug] || titles.reviews
}

/**
 * Get the navigation label for the content section.
 *
 * @param contentSlug - The content slug type
 * @returns Navigation label for the section
 *
 * @example
 * getContentNavLabel('reviews') // 'Reviews'
 * getContentNavLabel('blog') // 'Blog'
 */
export function getContentNavLabel(contentSlug: ContentSlugType): string {
  const labels: Record<ContentSlugType, string> = {
    reviews: 'Reviews',
    articles: 'Articles',
    guides: 'Guides',
    blog: 'Blog',
  }
  return labels[contentSlug] || labels.reviews
}

/**
 * Get the description for the content section.
 *
 * @param contentSlug - The content slug type
 * @returns Description text for the section
 */
export function getContentSectionDescription(contentSlug: ContentSlugType): string {
  const descriptions: Record<ContentSlugType, string> = {
    reviews: 'Expert reviews, product roundups, and comprehensive buying guides to help you make informed decisions.',
    articles: 'In-depth articles covering the latest trends, tips, and insights.',
    guides: 'Comprehensive guides to help you navigate your choices.',
    blog: 'Our latest posts, news, and updates.',
  }
  return descriptions[contentSlug] || descriptions.reviews
}

/**
 * Generate the URL for a category within the content section.
 *
 * @param siteSlug - The site's URL slug
 * @param categorySlug - The category's URL slug
 * @param contentSlug - The site's configured content slug (defaults to 'reviews')
 * @returns The full path to the category page
 *
 * @example
 * getArticleCategoryUrl('my-site', 'how-to', 'reviews') // '/my-site/reviews/how-to'
 */
export function getArticleCategoryUrl(
  siteSlug: string,
  categorySlug: string,
  contentSlug: ContentSlugType = DEFAULT_CONTENT_SLUG
): string {
  return `/${siteSlug}/${contentSlug}/${categorySlug}`
}

/**
 * Generate the URL for an article with optional category context.
 * If categorySlug is provided, the URL includes the category for better SEO.
 *
 * @param siteSlug - The site's URL slug
 * @param articleSlug - The article's URL slug
 * @param contentSlug - The site's configured content slug (defaults to 'reviews')
 * @param categorySlug - Optional category slug for nested URL
 * @returns The full path to the article page
 *
 * @example
 * getArticleUrlWithCategory('my-site', 'best-products', 'reviews') // '/my-site/reviews/best-products'
 * getArticleUrlWithCategory('my-site', 'best-products', 'reviews', 'how-to') // '/my-site/reviews/how-to/best-products'
 */
export function getArticleUrlWithCategory(
  siteSlug: string,
  articleSlug: string,
  contentSlug: ContentSlugType = DEFAULT_CONTENT_SLUG,
  categorySlug?: string
): string {
  if (categorySlug) {
    return `/${siteSlug}/${contentSlug}/${categorySlug}/${articleSlug}`
  }
  return `/${siteSlug}/${contentSlug}/${articleSlug}`
}
