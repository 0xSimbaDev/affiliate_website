/**
 * ProductCTA Utilities
 *
 * Provides niche-specific CTA text for affiliate buttons.
 * This keeps CTA messaging consistent across the site while
 * allowing customization per niche.
 */

type NicheSlug = string

interface CTAConfig {
  primary: string
  secondary: string
  compact: string
}

const nicheCTAConfig: Record<NicheSlug, CTAConfig> = {
  // Gaming / Tech
  gaming: {
    primary: 'Check Price',
    secondary: 'View Deal',
    compact: 'Buy',
  },
  tech: {
    primary: 'Check Price',
    secondary: 'View Deal',
    compact: 'Buy',
  },
  electronics: {
    primary: 'Check Price',
    secondary: 'View Deal',
    compact: 'Buy',
  },
  // Beauty / Fashion
  beauty: {
    primary: 'Shop Now',
    secondary: 'View Product',
    compact: 'Shop',
  },
  fashion: {
    primary: 'Shop Now',
    secondary: 'View Product',
    compact: 'Shop',
  },
  skincare: {
    primary: 'Shop Now',
    secondary: 'View Product',
    compact: 'Shop',
  },
  // Travel
  travel: {
    primary: 'Book Now',
    secondary: 'Check Availability',
    compact: 'Book',
  },
  hotels: {
    primary: 'Book Now',
    secondary: 'Check Rates',
    compact: 'Book',
  },
  // Software / Services
  software: {
    primary: 'Get Started',
    secondary: 'Try Free',
    compact: 'Start',
  },
  saas: {
    primary: 'Get Started',
    secondary: 'Try Free',
    compact: 'Start',
  },
  apps: {
    primary: 'Download',
    secondary: 'Get App',
    compact: 'Get',
  },
  // Finance
  finance: {
    primary: 'Apply Now',
    secondary: 'Learn More',
    compact: 'Apply',
  },
  // Health & Fitness
  health: {
    primary: 'Shop Now',
    secondary: 'View Details',
    compact: 'Shop',
  },
  fitness: {
    primary: 'Shop Now',
    secondary: 'View Details',
    compact: 'Shop',
  },
  // Home
  home: {
    primary: 'Shop Now',
    secondary: 'View Product',
    compact: 'Shop',
  },
  furniture: {
    primary: 'Shop Now',
    secondary: 'View Details',
    compact: 'Shop',
  },
}

const defaultCTAConfig: CTAConfig = {
  primary: 'Check Price',
  secondary: 'View Details',
  compact: 'Buy',
}

/**
 * Get the CTA configuration for a specific niche.
 *
 * @param nicheSlug - The niche slug (e.g., 'gaming', 'travel', 'beauty')
 * @returns CTA configuration with primary, secondary, and compact variants
 *
 * @example
 * const cta = getCTAConfig('travel')
 * // { primary: 'Book Now', secondary: 'Check Availability', compact: 'Book' }
 */
export function getCTAConfig(nicheSlug?: string | null): CTAConfig {
  if (!nicheSlug) return defaultCTAConfig
  const key = nicheSlug.toLowerCase()
  return nicheCTAConfig[key] || defaultCTAConfig
}

/**
 * Get the primary CTA text for a niche.
 *
 * @param nicheSlug - The niche slug
 * @returns Primary CTA text (e.g., 'Check Price', 'Book Now')
 *
 * @example
 * const ctaText = getPrimaryCTA('gaming') // 'Check Price'
 * const ctaText = getPrimaryCTA('travel') // 'Book Now'
 */
export function getPrimaryCTA(nicheSlug?: string | null): string {
  return getCTAConfig(nicheSlug).primary
}

/**
 * Get the secondary CTA text for a niche.
 *
 * @param nicheSlug - The niche slug
 * @returns Secondary CTA text (e.g., 'View Deal', 'Check Availability')
 */
export function getSecondaryCTA(nicheSlug?: string | null): string {
  return getCTAConfig(nicheSlug).secondary
}

/**
 * Get the compact CTA text for a niche.
 *
 * @param nicheSlug - The niche slug
 * @returns Compact CTA text (e.g., 'Buy', 'Book')
 */
export function getCompactCTA(nicheSlug?: string | null): string {
  return getCTAConfig(nicheSlug).compact
}
