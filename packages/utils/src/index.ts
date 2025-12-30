/**
 * @affiliate/utils
 *
 * Shared utility functions for the affiliate platform.
 */

export { cn } from './cn'
export { buildCanonicalUrl, buildOgImage, buildTwitterCard, getArticleSchemaType, getTwitterHandle, truncateForSeo, getSiteBaseUrl } from './seo'
export { getContentListUrl, getArticleUrl, getContentSectionTitle, getContentNavLabel, getContentSectionDescription, getArticleCategoryUrl, getArticleUrlWithCategory } from './content-url'
export { parseContent, extractShortcodes, extractShortcodeReferences, validateShortcodes, addHeadingIds } from './content-parser'
export { autoLinkContent, removeAutoLinks, countAutoLinks, productToLinkable, categoryToLinkable, type LinkableItem, type AutoLinkOptions } from './content-linker'

// Re-export types from content-parser
export type {
  ShortcodeType,
  ProductShortcode,
  ProductsShortcode,
  ComparisonShortcode,
  Shortcode,
  ParsedContentBlock,
  ShortcodeReferences,
} from './content-parser'
