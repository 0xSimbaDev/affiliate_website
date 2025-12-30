/**
 * Section Registry
 *
 * Central registry for all product page sections.
 * Sections are registered by ID and retrieved by the layout orchestrator.
 */

import type { SectionId, SectionComponent, SectionRegistry } from '../types'

/**
 * Section registry - maps section IDs to their components.
 * Populated by registerSection() calls.
 */
const sectionRegistry: SectionRegistry = new Map()

/**
 * Register a section component with the registry.
 *
 * @param id - Unique section identifier
 * @param component - React component for the section
 *
 * @example
 * registerSection('hero', HeroSection)
 * registerSection('specifications', SpecificationsTable)
 */
export function registerSection(id: SectionId, component: SectionComponent): void {
  if (sectionRegistry.has(id)) {
    console.warn(`Section "${id}" is already registered. Overwriting.`)
  }
  sectionRegistry.set(id, component)
}

/**
 * Get a section component by ID.
 *
 * @param id - Section identifier
 * @returns The section component, or undefined if not found
 *
 * @example
 * const HeroSection = getSection('hero')
 * if (HeroSection) {
 *   return <HeroSection />
 * }
 */
export function getSection(id: SectionId): SectionComponent | undefined {
  return sectionRegistry.get(id)
}

/**
 * Check if a section is registered.
 *
 * @param id - Section identifier
 * @returns true if section exists in registry
 */
export function hasSection(id: SectionId): boolean {
  return sectionRegistry.has(id)
}

/**
 * Get all registered section IDs.
 *
 * @returns Array of registered section IDs
 */
export function getRegisteredSections(): SectionId[] {
  return Array.from(sectionRegistry.keys())
}

/**
 * Clear all registered sections.
 * Mainly useful for testing.
 */
export function clearRegistry(): void {
  sectionRegistry.clear()
}

// ============================================================================
// AUTO-REGISTRATION
// ============================================================================

// Base sections are imported and registered when this module loads.
// This ensures all base sections are available without manual registration.

// Import and register base sections
import BreadcrumbSection from './base/BreadcrumbSection'
import HeroSection from './base/HeroSection'
import AffiliatePartnersSection from './base/AffiliatePartnersSection'
import ProsConsSection from './base/ProsConsSection'
import FullReviewSection from './base/FullReviewSection'
import FeaturedArticlesSection from './base/FeaturedArticlesSection'
import RelatedProductsSection from './base/RelatedProductsSection'
import StickyBarSection from './base/StickyBarSection'

// Register base sections
registerSection('breadcrumb', BreadcrumbSection)
registerSection('hero', HeroSection)
registerSection('affiliate-partners', AffiliatePartnersSection)
registerSection('pros-cons', ProsConsSection)
registerSection('full-review', FullReviewSection)
registerSection('featured-articles', FeaturedArticlesSection)
registerSection('related-products', RelatedProductsSection)
registerSection('sticky-bar', StickyBarSection)

// ============================================================================
// NICHE SECTION REGISTRATION
// ============================================================================

// Gaming/Tech sections
// Uncomment when implemented:
// import SpecificationsTable from './niche/gaming/SpecificationsTable'
// registerSection('specifications', SpecificationsTable)

// Beauty sections
// Uncomment when implemented:
// import IngredientsSection from './niche/beauty/IngredientsSection'
// import HowToUseSection from './niche/beauty/HowToUseSection'
// import SkinCompatibility from './niche/beauty/SkinCompatibility'
// registerSection('ingredients', IngredientsSection)
// registerSection('how-to-use', HowToUseSection)
// registerSection('skin-compatibility', SkinCompatibility)
