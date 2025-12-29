/**
 * Shared TypeScript types for the multi-niche affiliate platform.
 *
 * Re-exports all types from lib/types/index.ts for convenience.
 * Some legacy types are also defined here for backward compatibility.
 */

// Re-export all types from the types directory
export * from './types/index'

// Import types used in legacy interfaces
import type { ContentSlugType } from './types/site'

/**
 * Niche configuration
 */
export interface Niche {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Site with its associated niche
 */
export interface SiteWithNiche {
  id: string
  name: string
  slug: string
  domain: string | null
  tagline: string | null
  description: string | null
  logo: string | null
  favicon: string | null
  theme: Record<string, string> | null
  social: Record<string, string> | null
  settings: Record<string, unknown> | null
  nicheId: string
  contentSlug: ContentSlugType
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  niche: Niche | null
}

/**
 * Minimal site reference for lists and navigation
 */
export interface SiteReference {
  id: string
  slug: string
  name: string
  domain: string | null
}

/**
 * Product entity
 */
export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  shortDescription: string | null
  price: number | null
  originalPrice: number | null
  currency: string
  imageUrl: string | null
  affiliateUrl: string | null
  rating: number | null
  reviewCount: number | null
  features: string[]
  pros: string[]
  cons: string[]
  isFeatured: boolean
  isActive: boolean
  siteId: string
  categoryId: string | null
  createdAt: Date
  updatedAt: Date
}

// Note: Category is now re-exported from ./types/index
