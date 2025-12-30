/**
 * ContentRenderer Component
 *
 * Renders HTML content with shortcode replacements and auto-linking.
 * This is the main component for rendering article content with monetization.
 *
 * Features:
 * - Parses and renders [product:slug] shortcodes
 * - Parses and renders [products:category] shortcodes
 * - Parses and renders [comparison:slug1,slug2] shortcodes
 * - Auto-links product and category names to internal pages
 * - Adds IDs to headings for TOC navigation
 */

import { parseContent, addHeadingIds, type ParsedContentBlock } from '@affiliate/utils'
import { autoLinkContent, productToLinkable, categoryToLinkable } from '@affiliate/utils'
import InlineProductCard from './InlineProductCard'
import InlineProductGrid from './InlineProductGrid'
import InlineComparison from './InlineComparison'
import type { ProductCardData, CategoryReference } from '@affiliate/types'

// =============================================================================
// Types
// =============================================================================

interface ContentRendererProps {
  content: string
  siteSlug: string
  products: Map<string, ProductCardData & { primaryAffiliateUrl?: string | null }>
  categoryProducts: Map<string, (ProductCardData & { primaryAffiliateUrl?: string | null })[]>
  allProducts?: { slug: string; title: string }[]
  allCategories?: CategoryReference[]
  enableAutoLink?: boolean
  className?: string
}

// =============================================================================
// Main Component
// =============================================================================

export default function ContentRenderer({
  content,
  siteSlug,
  products,
  categoryProducts,
  allProducts = [],
  allCategories = [],
  enableAutoLink = true,
  className = '',
}: ContentRendererProps) {
  if (!content) {
    return null
  }

  // Add IDs to headings for TOC navigation
  let processedContent = addHeadingIds(content)

  // Apply auto-linking if enabled
  if (enableAutoLink && (allProducts.length > 0 || allCategories.length > 0)) {
    processedContent = autoLinkContent(processedContent, {
      siteSlug,
      products: allProducts.map(productToLinkable),
      categories: allCategories.map(categoryToLinkable),
      maxLinksPerTerm: 1,
    })
  }

  // Parse content into blocks
  const blocks = parseContent(processedContent)

  return (
    <div className={`content-renderer ${className}`}>
      {blocks.map((block, index) => (
        <ContentBlock
          key={index}
          block={block}
          siteSlug={siteSlug}
          products={products}
          categoryProducts={categoryProducts}
        />
      ))}
    </div>
  )
}

// =============================================================================
// Content Block Renderer
// =============================================================================

interface ContentBlockProps {
  block: ParsedContentBlock
  siteSlug: string
  products: Map<string, ProductCardData & { primaryAffiliateUrl?: string | null }>
  categoryProducts: Map<string, (ProductCardData & { primaryAffiliateUrl?: string | null })[]>
}

function ContentBlock({
  block,
  siteSlug,
  products,
  categoryProducts,
}: ContentBlockProps) {
  // HTML block - render with prose styling for proper typography
  if (block.type === 'html' && block.content) {
    return (
      <div
        className="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-strong:font-semibold prose-a:text-[color:var(--site-primary)] prose-a:no-underline hover:prose-a:underline prose-li:text-muted-foreground prose-blockquote:border-l-[color:var(--site-primary)] prose-blockquote:text-foreground"
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    )
  }

  // Product shortcode - wrapped in not-prose to prevent prose styling interference
  if (block.type === 'product' && block.shortcode?.type === 'product') {
    const { slug, variant } = block.shortcode
    const product = products.get(slug)

    if (!product) {
      // Product not found - render placeholder
      return (
        <div className="not-prose my-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          Product not found: {slug}
        </div>
      )
    }

    return (
      <div className="not-prose">
        <InlineProductCard
          product={product}
          siteSlug={siteSlug}
          variant={variant}
        />
      </div>
    )
  }

  // Products (by category) shortcode - wrapped in not-prose to prevent prose styling interference
  if (block.type === 'products' && block.shortcode?.type === 'products') {
    const { categorySlug, limit } = block.shortcode
    const categoryProductList = categoryProducts.get(categorySlug) || []

    if (categoryProductList.length === 0) {
      return (
        <div className="not-prose my-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          No products found for category: {categorySlug}
        </div>
      )
    }

    return (
      <div className="not-prose">
        <InlineProductGrid
          products={categoryProductList.slice(0, limit)}
          siteSlug={siteSlug}
        />
      </div>
    )
  }

  // Comparison shortcode - wrapped in not-prose to prevent prose styling interference
  if (block.type === 'comparison' && block.shortcode?.type === 'comparison') {
    const { slugs } = block.shortcode
    const comparisonProducts = slugs
      .map((slug) => products.get(slug))
      .filter((p): p is ProductCardData & { primaryAffiliateUrl?: string | null } => p !== undefined)

    if (comparisonProducts.length < 2) {
      return (
        <div className="not-prose my-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          Not enough products found for comparison. Found: {comparisonProducts.length}, Need: 2
        </div>
      )
    }

    return (
      <div className="not-prose">
        <InlineComparison
          products={comparisonProducts}
          siteSlug={siteSlug}
        />
      </div>
    )
  }

  // Unknown block type
  return null
}
