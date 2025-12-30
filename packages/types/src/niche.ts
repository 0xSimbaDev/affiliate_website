/**
 * Niche Type Definitions
 *
 * Defines the configuration structure for each affiliate niche (Travel, Finance, Tech, Health).
 * These types represent the JSON fields stored in the Niche model.
 */

/**
 * Layout configuration type for product pages (JSON structure).
 * This is what's stored in the database and returned by Prisma.
 * The full typed version is in lib/layouts/product/types.ts
 */
export type NicheLayoutConfigJson = Record<string, unknown> | null

/**
 * Definition for a product type within a niche.
 * Product types categorize different kinds of products/services.
 *
 * @example Travel niche: { slug: 'hotel', label: 'Hotel', labelPlural: 'Hotels', icon: 'building' }
 * @example Finance niche: { slug: 'credit-card', label: 'Credit Card', labelPlural: 'Credit Cards', icon: 'credit-card' }
 */
export interface ProductTypeDefinition {
  /** URL-safe identifier for the product type */
  slug: string
  /** Singular display label */
  label: string
  /** Plural display label */
  labelPlural: string
  /** Icon identifier (e.g., Lucide icon name) */
  icon: string
}

/**
 * Definition for a category type within a niche.
 * Category types define how products can be organized.
 *
 * @example Travel: { slug: 'destination', label: 'Destination', hierarchical: true, maxDepth: 3 }
 * @example Tech: { slug: 'brand', label: 'Brand', hierarchical: false, maxDepth: 1 }
 */
export interface CategoryTypeDefinition {
  /** URL-safe identifier for the category type */
  slug: string
  /** Display label for the category type */
  label: string
  /** Whether this category type supports parent/child relationships */
  hierarchical: boolean
  /** Maximum depth of hierarchy (1 = flat, 2+ = nested) */
  maxDepth: number
}

/**
 * Configuration for an affiliate partner/network.
 *
 * @example { slug: 'booking-com', name: 'Booking.com', productTypes: ['hotel', 'vacation-rental'] }
 */
export interface AffiliatePartner {
  /** URL-safe identifier for the partner */
  slug: string
  /** Display name of the affiliate partner */
  name: string
  /** List of product type slugs this partner supports */
  productTypes: string[]
}

/**
 * Complete configuration for a niche.
 * Extends the base Prisma Niche model with typed JSON fields.
 */
export interface NicheConfig {
  /** Unique identifier */
  id: string
  /** URL-safe slug (e.g., 'travel', 'finance') */
  slug: string
  /** Display name */
  name: string
  /** Optional description */
  description: string | null
  /** Available product types for this niche */
  productTypes: ProductTypeDefinition[]
  /** Available category types for this niche */
  categoryTypes: CategoryTypeDefinition[]
  /** Configured affiliate partners */
  partners: AffiliatePartner[]
  /** Product page layout configuration (JSON from database) */
  layoutConfig?: NicheLayoutConfigJson
  /** Creation timestamp */
  createdAt: Date
  /** Last update timestamp */
  updatedAt: Date
}

/**
 * Input type for creating a new niche configuration
 */
export interface NicheConfigInput {
  slug: string
  name: string
  description?: string | null
  productTypes: ProductTypeDefinition[]
  categoryTypes: CategoryTypeDefinition[]
  partners: AffiliatePartner[]
}
