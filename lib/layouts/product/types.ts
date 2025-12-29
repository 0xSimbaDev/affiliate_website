/**
 * Product Page Layout Type Definitions
 *
 * Defines the configuration-driven layout system for product pages.
 * Layouts are stored in the Niche model and rendered by ProductPageLayout.
 */

import type { ReactNode } from 'react'
import type { SiteWithNiche, ContentSlugType, ProductWithCategories, AffiliateLink, ProductCardData } from '@/lib/types'
import type { ArticleWithProductContext } from '@/lib/api/articles'

// ============================================================================
// SECTION IDENTIFIERS
// ============================================================================

/**
 * Base section identifiers available across all niches.
 */
export type BaseSectionId =
  | 'breadcrumb'
  | 'hero'
  | 'affiliate-partners'
  | 'pros-cons'
  | 'full-review'
  | 'featured-articles'
  | 'related-products'
  | 'sticky-bar'

/**
 * Gaming/Tech niche section identifiers.
 */
export type GamingSectionId =
  | 'specifications'
  | 'performance-metrics'

/**
 * Beauty niche section identifiers.
 */
export type BeautySectionId =
  | 'ingredients'
  | 'how-to-use'
  | 'skin-compatibility'

/**
 * All available section identifiers.
 * New niche sections can be added to this union.
 */
export type SectionId = BaseSectionId | GamingSectionId | BeautySectionId

// ============================================================================
// SECTION CONFIGURATION
// ============================================================================

/**
 * Configuration for a single section in the layout.
 */
export interface SectionConfig {
  /** Unique section identifier */
  id: SectionId
  /** Whether the section is enabled (default: true) */
  enabled?: boolean
  /** Custom props to pass to the section component */
  props?: Record<string, unknown>
  /**
   * Metadata field that must exist for section to render.
   * If specified, section only shows when product.metadata[conditionField] exists.
   * @example 'specifications' - only show if metadata.specifications exists
   */
  conditionField?: string
}

// ============================================================================
// LAYOUT ZONES
// ============================================================================

/**
 * Available layout zone identifiers.
 * Zones define distinct areas of the page where sections can be placed.
 */
export type ZoneId = 'header' | 'hero' | 'main' | 'sidebar' | 'overlay'

/**
 * Configuration for a layout zone.
 */
export interface LayoutZone {
  /** Zone identifier */
  id: ZoneId
  /** Sections to render in this zone, in order */
  sections: SectionConfig[]
}

// ============================================================================
// LAYOUT OPTIONS
// ============================================================================

/**
 * Layout-level options that affect the overall page structure.
 */
export interface LayoutOptions {
  /** Use two-column hero layout on desktop (default: true) */
  twoColumnHero?: boolean
  /** Maximum content width */
  maxWidth?: 'narrow' | 'default' | 'wide'
  /** Custom class name for the page container */
  containerClassName?: string
}

// ============================================================================
// NICHE LAYOUT CONFIG
// ============================================================================

/**
 * Complete layout configuration for a niche.
 * This is stored in Niche.layoutConfig JSON field.
 */
export interface NicheLayoutConfig {
  /** Layout zones with their sections */
  zones: LayoutZone[]
  /** Layout-level options */
  options?: LayoutOptions
}

// ============================================================================
// PRODUCT PAGE CONTEXT
// ============================================================================

/**
 * Product metadata structure with common fields.
 * Niches can extend this with additional fields.
 */
export interface ProductMetadata {
  /** Product advantages */
  pros?: string[]
  /** Product disadvantages */
  cons?: string[]
  /** Key features list */
  features?: string[]
  /** Technical specifications (Gaming/Tech) */
  specifications?: Record<string, string>
  /** Performance benchmarks (Gaming/Tech) */
  benchmarks?: Array<{
    name: string
    score: number
    maxScore: number
    unit?: string
  }>
  /** Ingredients list (Beauty) */
  ingredients?: Array<{
    name: string
    description?: string
    isKey?: boolean
  }>
  /** Usage instructions (Beauty) */
  howToUse?: Array<{
    step: number
    instruction: string
    timing?: string
  }>
  /** Suitable skin types (Beauty) */
  skinTypes?: string[]
  /** Allow additional unknown fields */
  [key: string]: unknown
}

/**
 * Breadcrumb item for navigation.
 */
export interface BreadcrumbItem {
  /** Display name */
  name: string
  /** Full URL */
  url: string
}

/**
 * Formatted price information.
 */
export interface FormattedPrice {
  /** Primary formatted price (e.g., "$99") */
  primary: string | null
  /** Secondary price for ranges (e.g., "$149") */
  secondary?: string | null
  /** Human-readable price text */
  text?: string | null
}

/**
 * Context data available to all sections.
 * Provided via React Context for easy access.
 */
export interface ProductPageContextData {
  // Site data
  site: SiteWithNiche
  siteSlug: string
  contentSlug: ContentSlugType
  nicheSlug: string | null

  // Product data
  product: ProductWithCategories
  metadata: ProductMetadata

  // Computed values
  rating: number | null
  price: FormattedPrice
  allImages: string[]
  breadcrumbItems: BreadcrumbItem[]

  // Affiliate data
  affiliateLinks: AffiliateLink[]
  primaryPartner: string | undefined
  ctaText: string

  // URLs
  baseUrl: string
  productUrl: string

  // Primary category
  primaryCategory: {
    id: string
    slug: string
    name: string
  } | null

  // Related data
  relatedProducts: ProductCardData[]
  featuredArticles: ArticleWithProductContext[]
}

// ============================================================================
// SECTION COMPONENT PROPS
// ============================================================================

/**
 * Base props that all section components receive.
 * Context is available via useProductPage() hook.
 */
export interface SectionProps {
  /** Custom class name */
  className?: string
  /** Additional props from section config */
  [key: string]: unknown
}

/**
 * Section component type definition.
 */
export type SectionComponent = (props: SectionProps) => ReactNode

// ============================================================================
// SECTION REGISTRY
// ============================================================================

/**
 * Section registration entry.
 */
export interface SectionRegistration {
  /** Section identifier */
  id: SectionId
  /** Section component */
  component: SectionComponent
  /** Optional display name for debugging */
  displayName?: string
}

/**
 * Section registry type.
 */
export type SectionRegistry = Map<SectionId, SectionComponent>
