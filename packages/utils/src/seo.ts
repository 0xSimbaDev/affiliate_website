/**
 * SEO Utility Functions
 *
 * Helper functions for building SEO-related URLs and metadata.
 */

import type { SiteWithNiche } from '@affiliate/types';

/**
 * Build a canonical URL for a page using the site's configured domain.
 *
 * @param site - The site with its configuration
 * @param path - The path after the domain (e.g., "/products/sony-headphones")
 * @returns The full canonical URL
 *
 * @example
 * const url = buildCanonicalUrl(site, "/products/sony-headphones")
 * // Returns: "https://techflow.com/products/sony-headphones"
 */
export function buildCanonicalUrl(site: SiteWithNiche, path: string = ''): string {
  // Ensure domain doesn't have trailing slash and path starts with /
  const domain = (site.domain || 'example.com').replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Use HTTPS by default
  const protocol = 'https://';

  return `${protocol}${domain}${normalizedPath}`;
}

/**
 * Build the base URL for a site.
 *
 * @param site - The site with its configuration
 * @returns The base URL without trailing slash
 *
 * @example
 * const baseUrl = getSiteBaseUrl(site)
 * // Returns: "https://techflow.com"
 */
export function getSiteBaseUrl(site: SiteWithNiche): string {
  return buildCanonicalUrl(site, '');
}

/**
 * Build Open Graph image metadata with proper dimensions.
 *
 * @param imageUrl - The image URL
 * @param alt - Alt text for the image
 * @returns Open Graph image metadata object
 */
export function buildOgImage(imageUrl: string, alt: string) {
  return {
    url: imageUrl,
    alt,
    width: 1200,
    height: 630,
  };
}

/**
 * Build Twitter card metadata.
 *
 * @param options - Card options
 * @returns Twitter card metadata object
 */
export function buildTwitterCard(options: {
  title: string;
  description?: string;
  image?: string;
  site?: string;
  creator?: string;
}) {
  return {
    card: 'summary_large_image' as const,
    title: options.title,
    ...(options.description && { description: options.description }),
    ...(options.image && { images: [options.image] }),
    ...(options.site && { site: options.site }),
    ...(options.creator && { creator: options.creator }),
  };
}

/**
 * Get the article type schema mapping for JSON-LD.
 *
 * @param articleType - The article type from the database
 * @returns The appropriate schema type
 */
export function getArticleSchemaType(
  articleType: string
): 'Article' | 'Review' | 'HowTo' | 'ItemList' {
  switch (articleType) {
    case 'REVIEW':
      return 'Review';
    case 'HOW_TO':
      return 'HowTo';
    case 'ROUNDUP':
    case 'COMPARISON':
      return 'ItemList';
    case 'BUYING_GUIDE':
    default:
      return 'Article';
  }
}

/**
 * Get the Twitter handle from a social object.
 *
 * @param social - The site's social configuration
 * @returns The Twitter handle with @ prefix, or undefined
 */
export function getTwitterHandle(social: Record<string, unknown> | null): string | undefined {
  if (!social?.twitter) return undefined;

  const twitter = social.twitter as string;

  // If it's already a handle, ensure it has @
  if (twitter.startsWith('@')) return twitter;

  // If it's a URL, extract the handle
  const match = twitter.match(/twitter\.com\/([^/?]+)/i) || twitter.match(/x\.com\/([^/?]+)/i);
  if (match) return `@${match[1]}`;

  // Assume it's a handle without @
  return `@${twitter}`;
}

/**
 * Truncate text for SEO descriptions (max 160 characters).
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length (default: 160)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateForSeo(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
}
