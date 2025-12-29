/**
 * Content Auto-Linker Utility
 *
 * Automatically links product names and category names in HTML content
 * to their internal pages. This improves internal linking for SEO and
 * user navigation.
 *
 * Features:
 * - Case-insensitive word boundary matching
 * - Skips existing links, headings, code blocks
 * - Limits to first occurrence only (prevents over-linking)
 * - Preserves original HTML structure
 */

// =============================================================================
// Types
// =============================================================================

export interface LinkableItem {
  slug: string
  name: string
  type: 'product' | 'category'
}

export interface AutoLinkOptions {
  siteSlug: string
  products: LinkableItem[]
  categories: LinkableItem[]
  maxLinksPerTerm?: number // Prevent over-linking (default: 1)
  contentSlug?: string // For category links (e.g., 'reviews')
}

// =============================================================================
// Constants
// =============================================================================

// Tags where we should NOT auto-link
const SKIP_TAGS = ['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'script', 'style']

// Build regex pattern for skip tags
const SKIP_TAGS_PATTERN = new RegExp(
  `<(${SKIP_TAGS.join('|')})[^>]*>.*?<\\/\\1>`,
  'gis'
)

// =============================================================================
// Main Function
// =============================================================================

/**
 * Auto-link product names and category names in HTML content.
 * Uses case-insensitive matching with word boundaries.
 * Skips content inside existing links, headings, and code blocks.
 */
export function autoLinkContent(html: string, options: AutoLinkOptions): string {
  if (!html) {
    return html
  }

  const { siteSlug, products, categories, maxLinksPerTerm = 1 } = options

  // Track how many times each term has been linked
  const linkCounts = new Map<string, number>()

  // Combine products and categories into a single list with metadata
  const linkableItems: Array<LinkableItem & { url: string }> = [
    ...products.map((p) => ({
      ...p,
      url: `/${siteSlug}/products/${p.slug}`,
    })),
    ...categories.map((c) => ({
      ...c,
      url: `/${siteSlug}/categories/${c.slug}`,
    })),
  ]

  // Sort by name length (longest first) to prevent partial matches
  linkableItems.sort((a, b) => b.name.length - a.name.length)

  // First, identify protected regions (existing links, headings, code, etc.)
  const protectedRegions = findProtectedRegions(html)

  // Process each linkable item
  let result = html
  for (const item of linkableItems) {
    result = linkTerm(result, item, protectedRegions, linkCounts, maxLinksPerTerm)
  }

  return result
}

// =============================================================================
// Helper Functions
// =============================================================================

interface ProtectedRegion {
  start: number
  end: number
}

/**
 * Find all regions in the HTML that should not be auto-linked.
 */
function findProtectedRegions(html: string): ProtectedRegion[] {
  const regions: ProtectedRegion[] = []

  // Find all skip tag regions
  const skipPattern = new RegExp(SKIP_TAGS_PATTERN.source, 'gis')
  let match: RegExpExecArray | null
  while ((match = skipPattern.exec(html)) !== null) {
    regions.push({
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  // Find all existing anchor tags (even nested/complex ones)
  // Use [\s\S] instead of . with 's' flag for cross-browser compatibility
  const anchorPattern = /<a\s[^>]*>[\s\S]*?<\/a>/gi
  while ((match = anchorPattern.exec(html)) !== null) {
    regions.push({
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  // Find all HTML tags (we don't want to link inside attributes)
  const tagPattern = /<[^>]+>/g
  while ((match = tagPattern.exec(html)) !== null) {
    regions.push({
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  // Sort and merge overlapping regions
  return mergeRegions(regions)
}

/**
 * Merge overlapping protected regions.
 */
function mergeRegions(regions: ProtectedRegion[]): ProtectedRegion[] {
  if (regions.length === 0) return []

  // Sort by start position
  const sorted = [...regions].sort((a, b) => a.start - b.start)
  const merged: ProtectedRegion[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]
    const last = merged[merged.length - 1]

    if (current.start <= last.end) {
      // Overlapping, merge
      last.end = Math.max(last.end, current.end)
    } else {
      // Non-overlapping, add new region
      merged.push(current)
    }
  }

  return merged
}

/**
 * Check if a position is inside any protected region.
 */
function isProtected(position: number, length: number, regions: ProtectedRegion[]): boolean {
  const end = position + length
  return regions.some(
    (region) =>
      (position >= region.start && position < region.end) ||
      (end > region.start && end <= region.end) ||
      (position < region.start && end > region.end)
  )
}

/**
 * Link occurrences of a term in the HTML.
 */
function linkTerm(
  html: string,
  item: LinkableItem & { url: string },
  protectedRegions: ProtectedRegion[],
  linkCounts: Map<string, number>,
  maxLinks: number
): string {
  const key = item.name.toLowerCase()
  const currentCount = linkCounts.get(key) || 0

  if (currentCount >= maxLinks) {
    return html // Already linked enough times
  }

  // Escape special regex characters in the name
  const escapedName = escapeRegex(item.name)

  // Create word boundary pattern (case-insensitive)
  // Use lookbehind and lookahead for word boundaries that work with Unicode
  const pattern = new RegExp(`\\b(${escapedName})\\b`, 'gi')

  let result = ''
  let lastIndex = 0
  let match: RegExpExecArray | null
  let linked = currentCount

  while ((match = pattern.exec(html)) !== null && linked < maxLinks) {
    const matchStart = match.index
    const matchEnd = matchStart + match[0].length
    const matchedText = match[1]

    // Check if this match is in a protected region
    if (isProtected(matchStart, match[0].length, protectedRegions)) {
      continue
    }

    // Add content before this match
    result += html.slice(lastIndex, matchStart)

    // Add the linked version
    result += `<a href="${item.url}" class="auto-link auto-link-${item.type}">${matchedText}</a>`

    lastIndex = matchEnd
    linked++
  }

  // Add remaining content
  result += html.slice(lastIndex)

  // Update link count
  linkCounts.set(key, linked)

  return result
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Remove auto-links from content (useful for re-processing).
 */
export function removeAutoLinks(html: string): string {
  if (!html) {
    return html
  }

  // Remove auto-link anchor tags, keeping their text content
  return html.replace(
    /<a\s+[^>]*class="[^"]*auto-link[^"]*"[^>]*>(.*?)<\/a>/gi,
    '$1'
  )
}

/**
 * Count auto-links in content.
 */
export function countAutoLinks(html: string): number {
  if (!html) {
    return 0
  }

  const matches = html.match(/<a\s+[^>]*class="[^"]*auto-link[^"]*"[^>]*>/gi)
  return matches ? matches.length : 0
}

/**
 * Create a LinkableItem from product data.
 */
export function productToLinkable(product: { slug: string; title: string }): LinkableItem {
  return {
    slug: product.slug,
    name: product.title,
    type: 'product',
  }
}

/**
 * Create a LinkableItem from category data.
 */
export function categoryToLinkable(category: { slug: string; name: string }): LinkableItem {
  return {
    slug: category.slug,
    name: category.name,
    type: 'category',
  }
}
