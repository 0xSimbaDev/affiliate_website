/**
 * Product Page Layout System
 *
 * Modular, configuration-driven product page architecture.
 *
 * @example
 * // In product page:
 * import {
 *   ProductPageLayout,
 *   buildProductPageContext,
 *   resolveLayoutConfig,
 * } from '@/lib/layouts/product'
 *
 * const layoutConfig = resolveLayoutConfig(site.niche?.layoutConfig)
 * const contextData = buildProductPageContext(site, product, related, articles)
 *
 * return <ProductPageLayout config={layoutConfig} contextData={contextData} />
 */

// Main layout component
export { default as ProductPageLayout } from './ProductPageLayout'

// Context and hook
export { ProductPageProvider, useProductPage, useProductPageOptional } from './context'

// Section registry
export {
  registerSection,
  getSection,
  hasSection,
  getRegisteredSections,
} from './sections'

// Default configs
export {
  defaultLayoutConfig,
  gamingLayoutConfig,
  beautyLayoutConfig,
  resolveLayoutConfig,
} from './defaults'

// Utilities
export { buildProductPageContext } from './utils'

// Types
export type {
  // Section identifiers
  SectionId,
  BaseSectionId,
  GamingSectionId,
  BeautySectionId,

  // Configuration
  SectionConfig,
  ZoneId,
  LayoutZone,
  LayoutOptions,
  NicheLayoutConfig,

  // Context
  ProductMetadata,
  BreadcrumbItem,
  FormattedPrice,
  ProductPageContextData,

  // Components
  SectionProps,
  SectionComponent,
  SectionRegistration,
  SectionRegistry,
} from './types'
