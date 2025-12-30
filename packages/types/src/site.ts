/**
 * Site Type Definitions
 *
 * Defines the configuration structure for individual affiliate sites.
 * Each site belongs to a niche and has its own domain, theme, and settings.
 */

import type { NicheConfig } from './niche'

/**
 * Theme configuration for a site.
 * Defines the visual styling using CSS custom property values.
 */
export interface SiteTheme {
  /** Primary brand color (e.g., '#1a56db' or 'hsl(220, 80%, 50%)') */
  primaryColor: string
  /** Secondary brand color */
  secondaryColor: string
  /** Accent color for highlights and CTAs */
  accentColor: string
  /** Optional background color override */
  backgroundColor?: string
  /** Optional text color override */
  textColor?: string
  /** Optional font family for headings */
  fontHeading?: string
  /** Optional font family for body text */
  fontBody?: string
}

/**
 * Social media links for a site.
 * All fields are optional as sites may not have all platforms.
 */
export interface SiteSocial {
  /** Twitter/X profile URL or handle */
  twitter?: string
  /** Instagram profile URL or handle */
  instagram?: string
  /** Facebook page URL */
  facebook?: string
  /** Pinterest profile URL */
  pinterest?: string
  /** YouTube channel URL */
  youtube?: string
  /** TikTok profile URL */
  tiktok?: string
  /** LinkedIn company page URL */
  linkedin?: string
}

/**
 * Valid content slugs for the content section.
 * Each site can choose one of these for their articles/reviews section.
 */
export type ContentSlugType = 'reviews' | 'articles' | 'guides' | 'blog'

/**
 * Default content slug if not configured.
 */
export const DEFAULT_CONTENT_SLUG: ContentSlugType = 'reviews'

/**
 * All valid content slugs for routing.
 */
export const VALID_CONTENT_SLUGS: ContentSlugType[] = ['reviews', 'articles', 'guides', 'blog']

/**
 * Base site configuration matching Prisma Site model.
 */
export interface Site {
  /** Unique identifier */
  id: string
  /** Reference to parent niche */
  nicheId: string
  /** URL-safe slug */
  slug: string
  /** Site name */
  name: string
  /** Custom domain for the site */
  domain: string
  /** Short tagline/slogan */
  tagline: string | null
  /** Longer description */
  description: string | null
  /** Theme configuration (stored as JSON in DB) */
  theme: SiteTheme
  /** Social media links (stored as JSON in DB) */
  social: SiteSocial | null
  /** Google Tag Manager container ID */
  gtmId: string | null
  /** CDN base URL for static assets */
  cdnBaseUrl: string | null
  /** URL slug for the content section (e.g., "reviews", "articles", "guides", "blog") */
  contentSlug: ContentSlugType
  /** Whether the site is active/published */
  isActive: boolean
  /** Creation timestamp */
  createdAt: Date
  /** Last update timestamp */
  updatedAt: Date
}

/**
 * Site with its parent niche configuration.
 * Used when you need both site and niche data together.
 */
export interface SiteWithNiche extends Site {
  /** The niche this site belongs to */
  niche: NicheConfig
}

/**
 * Minimal site reference for listings and dropdowns.
 */
export interface SiteReference {
  id: string
  slug: string
  name: string
  domain: string
}

/**
 * Input type for creating a new site.
 */
export interface SiteInput {
  nicheId: string
  slug: string
  name: string
  domain: string
  tagline?: string | null
  description?: string | null
  theme: SiteTheme
  social?: SiteSocial | null
  gtmId?: string | null
  cdnBaseUrl?: string | null
  contentSlug?: ContentSlugType
  isActive?: boolean
}
