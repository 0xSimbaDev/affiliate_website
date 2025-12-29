/**
 * Content Parser Utility
 *
 * Parses HTML content to extract and replace shortcodes with React components.
 * Supports:
 * - [product:slug] or [product:slug,variant] - Single product card
 * - [products:category-slug] or [products:category-slug,limit] - Products from category
 * - [comparison:slug1,slug2] or [comparison:slug1,slug2,slug3] - Side-by-side comparison
 */

import type { ProductCardData, CategoryReference } from '@/lib/types'

// =============================================================================
// Types
// =============================================================================

export type ShortcodeType = 'product' | 'products' | 'comparison'

export interface ProductShortcode {
  type: 'product'
  slug: string
  variant: 'default' | 'compact' | 'featured'
  position: number // Position in original HTML
}

export interface ProductsShortcode {
  type: 'products'
  categorySlug: string
  limit: number
  position: number
}

export interface ComparisonShortcode {
  type: 'comparison'
  slugs: string[]
  position: number
}

export type Shortcode = ProductShortcode | ProductsShortcode | ComparisonShortcode

export interface ParsedContentBlock {
  type: 'html' | 'product' | 'products' | 'comparison'
  content?: string // For HTML blocks
  shortcode?: Shortcode // For shortcode blocks
}

export interface ShortcodeReferences {
  productSlugs: string[]
  categorySlugs: string[]
}

export interface ContentParserContext {
  siteSlug: string
  products: Map<string, ProductCardData>
  categories: Map<string, CategoryReference>
  categoryProducts: Map<string, ProductCardData[]> // categorySlug -> products
}

// =============================================================================
// Regex Patterns
// =============================================================================

// Match [product:slug] or [product:slug,variant]
const PRODUCT_PATTERN = /\[product:([a-z0-9-]+)(?:,(\w+))?\]/gi

// Match [products:category-slug] or [products:category-slug,limit]
const PRODUCTS_PATTERN = /\[products:([a-z0-9-]+)(?:,(\d+))?\]/gi

// Match [comparison:slug1,slug2] or [comparison:slug1,slug2,slug3]
const COMPARISON_PATTERN = /\[comparison:([a-z0-9-,]+)\]/gi

// =============================================================================
// Extraction Functions
// =============================================================================

/**
 * Extract all shortcode references from HTML content.
 * Used to pre-fetch all needed products/categories in a single query.
 */
export function extractShortcodeReferences(html: string): ShortcodeReferences {
  const productSlugs = new Set<string>()
  const categorySlugs = new Set<string>()

  if (!html) {
    return { productSlugs: [], categorySlugs: [] }
  }

  // Extract product slugs from [product:slug] shortcodes
  let match: RegExpExecArray | null
  const productPattern = new RegExp(PRODUCT_PATTERN.source, 'gi')
  while ((match = productPattern.exec(html)) !== null) {
    productSlugs.add(match[1])
  }

  // Extract category slugs from [products:category] shortcodes
  const productsPattern = new RegExp(PRODUCTS_PATTERN.source, 'gi')
  while ((match = productsPattern.exec(html)) !== null) {
    categorySlugs.add(match[1])
  }

  // Extract product slugs from [comparison:slug1,slug2] shortcodes
  const comparisonPattern = new RegExp(COMPARISON_PATTERN.source, 'gi')
  while ((match = comparisonPattern.exec(html)) !== null) {
    const slugs = match[1].split(',').map((s) => s.trim())
    slugs.forEach((slug) => productSlugs.add(slug))
  }

  return {
    productSlugs: Array.from(productSlugs),
    categorySlugs: Array.from(categorySlugs),
  }
}

/**
 * Extract all shortcodes with their positions and metadata.
 */
export function extractShortcodes(html: string): Shortcode[] {
  const shortcodes: Shortcode[] = []

  if (!html) {
    return shortcodes
  }

  // Extract [product:slug] shortcodes
  const productPattern = new RegExp(PRODUCT_PATTERN.source, 'gi')
  let match: RegExpExecArray | null
  while ((match = productPattern.exec(html)) !== null) {
    const variant = match[2]?.toLowerCase() as 'default' | 'compact' | 'featured' | undefined
    shortcodes.push({
      type: 'product',
      slug: match[1],
      variant: variant || 'default',
      position: match.index,
    })
  }

  // Extract [products:category] shortcodes
  const productsPattern = new RegExp(PRODUCTS_PATTERN.source, 'gi')
  while ((match = productsPattern.exec(html)) !== null) {
    shortcodes.push({
      type: 'products',
      categorySlug: match[1],
      limit: match[2] ? parseInt(match[2], 10) : 3,
      position: match.index,
    })
  }

  // Extract [comparison:slug1,slug2] shortcodes
  const comparisonPattern = new RegExp(COMPARISON_PATTERN.source, 'gi')
  while ((match = comparisonPattern.exec(html)) !== null) {
    shortcodes.push({
      type: 'comparison',
      slugs: match[1].split(',').map((s) => s.trim()),
      position: match.index,
    })
  }

  // Sort by position
  return shortcodes.sort((a, b) => a.position - b.position)
}

// =============================================================================
// Parsing Functions
// =============================================================================

/**
 * Parse HTML content into blocks, splitting at shortcode positions.
 * Returns an array of ParsedContentBlock that can be rendered.
 */
export function parseContent(html: string): ParsedContentBlock[] {
  if (!html) {
    return []
  }

  const blocks: ParsedContentBlock[] = []
  const shortcodes = extractShortcodes(html)

  if (shortcodes.length === 0) {
    // No shortcodes, return as single HTML block
    return [{ type: 'html', content: html }]
  }

  let lastIndex = 0

  for (const shortcode of shortcodes) {
    // Get the original shortcode text to find its length
    const shortcodeText = getShortcodeText(shortcode)
    const shortcodeLength = shortcodeText.length

    // Add HTML content before this shortcode
    if (shortcode.position > lastIndex) {
      const htmlContent = html.slice(lastIndex, shortcode.position)
      if (htmlContent.trim()) {
        blocks.push({ type: 'html', content: htmlContent })
      }
    }

    // Add the shortcode block
    blocks.push({
      type: shortcode.type,
      shortcode,
    })

    lastIndex = shortcode.position + shortcodeLength
  }

  // Add remaining HTML content after last shortcode
  if (lastIndex < html.length) {
    const remainingHtml = html.slice(lastIndex)
    if (remainingHtml.trim()) {
      blocks.push({ type: 'html', content: remainingHtml })
    }
  }

  return blocks
}

/**
 * Reconstruct the original shortcode text for a given shortcode object.
 */
function getShortcodeText(shortcode: Shortcode): string {
  switch (shortcode.type) {
    case 'product':
      return shortcode.variant === 'default'
        ? `[product:${shortcode.slug}]`
        : `[product:${shortcode.slug},${shortcode.variant}]`
    case 'products':
      return shortcode.limit === 3
        ? `[products:${shortcode.categorySlug}]`
        : `[products:${shortcode.categorySlug},${shortcode.limit}]`
    case 'comparison':
      return `[comparison:${shortcode.slugs.join(',')}]`
    default:
      return ''
  }
}

// =============================================================================
// Heading Extraction (for TOC)
// =============================================================================

export interface HeadingData {
  id: string
  text: string
  level: 2 | 3
}

/**
 * Extract headings (h2, h3) from HTML content for table of contents.
 */
export function extractHeadings(html: string): HeadingData[] {
  if (!html) {
    return []
  }

  const headings: HeadingData[] = []
  const headingPattern = /<h([23])(?:[^>]*id="([^"]*)")?[^>]*>(.*?)<\/h\1>/gi

  let match: RegExpExecArray | null
  while ((match = headingPattern.exec(html)) !== null) {
    const level = parseInt(match[1], 10) as 2 | 3
    const existingId = match[2]
    const rawText = match[3]
    // Strip HTML tags from heading text
    const text = rawText.replace(/<[^>]+>/g, '').trim()

    if (text) {
      // Generate ID from text if not provided
      const id = existingId || generateHeadingId(text)
      headings.push({ id, text, level })
    }
  }

  return headings
}

/**
 * Generate a URL-friendly ID from heading text.
 */
function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Add IDs to headings in HTML content that don't have them.
 * This allows the TOC to link to headings properly.
 */
export function addHeadingIds(html: string): string {
  if (!html) {
    return html
  }

  return html.replace(
    /<h([23])([^>]*)>(.*?)<\/h\1>/gi,
    (match, level, attrs, content) => {
      // Check if ID already exists
      if (/id\s*=/.test(attrs)) {
        return match
      }

      const text = content.replace(/<[^>]+>/g, '').trim()
      const id = generateHeadingId(text)

      return `<h${level}${attrs} id="${id}">${content}</h${level}>`
    }
  )
}

// =============================================================================
// Validation
// =============================================================================

/**
 * Validate that all shortcode references can be resolved.
 * Returns list of missing slugs.
 */
export function validateShortcodes(
  html: string,
  products: Map<string, ProductCardData>,
  categories: Map<string, CategoryReference>
): { missingProducts: string[]; missingCategories: string[] } {
  const refs = extractShortcodeReferences(html)

  const missingProducts = refs.productSlugs.filter((slug) => !products.has(slug))
  const missingCategories = refs.categorySlugs.filter((slug) => !categories.has(slug))

  return { missingProducts, missingCategories }
}
