'use client'

/**
 * Product Page Layout Orchestrator
 *
 * Renders product page sections based on layout configuration.
 * Wraps content in ProductPageProvider for context access.
 */

import { ProductPageProvider } from './context'
import { getSection } from './sections'
import type {
  NicheLayoutConfig,
  ProductPageContextData,
  SectionConfig,
  LayoutZone,
} from './types'
import { cn } from '@/lib/utils'

interface ProductPageLayoutProps {
  /** Layout configuration (from niche or default) */
  config: NicheLayoutConfig
  /** Context data for all sections */
  contextData: ProductPageContextData
}

/**
 * Render a single section based on its config.
 */
function renderSection(
  sectionConfig: SectionConfig,
  contextData: ProductPageContextData
) {
  const { id, enabled = true, props = {}, conditionField } = sectionConfig

  // Skip disabled sections
  if (!enabled) {
    return null
  }

  // Check condition field in metadata
  if (conditionField) {
    const fieldValue = contextData.metadata[conditionField]
    if (fieldValue === undefined || fieldValue === null) {
      return null
    }
    // For arrays, check if non-empty
    if (Array.isArray(fieldValue) && fieldValue.length === 0) {
      return null
    }
  }

  // Get section component from registry
  const SectionComponent = getSection(id)
  if (!SectionComponent) {
    console.warn(`Section "${id}" not found in registry`)
    return null
  }

  return <SectionComponent key={id} {...props} />
}

/**
 * Render a layout zone with its sections.
 */
function renderZone(zone: LayoutZone, contextData: ProductPageContextData) {
  const sections = zone.sections
    .map((config) => renderSection(config, contextData))
    .filter(Boolean)

  if (sections.length === 0) {
    return null
  }

  return sections
}

/**
 * Product Page Layout Component
 *
 * Orchestrates the rendering of all sections based on the layout config.
 * Provides context to all child sections.
 */
export default function ProductPageLayout({
  config,
  contextData,
}: ProductPageLayoutProps) {
  const { options = {} } = config
  const { twoColumnHero = true, maxWidth = 'default' } = options

  // Get zones
  const headerZone = config.zones.find((z) => z.id === 'header')
  const heroZone = config.zones.find((z) => z.id === 'hero')
  const mainZone = config.zones.find((z) => z.id === 'main')
  const overlayZone = config.zones.find((z) => z.id === 'overlay')

  // Separate hero section from other hero-zone sections
  const heroSectionConfig = heroZone?.sections.find((s) => s.id === 'hero')
  const heroOtherSections = heroZone?.sections.filter((s) => s.id !== 'hero') || []

  return (
    <ProductPageProvider value={contextData}>
      <article className="min-h-screen pb-24 lg:pb-16">
        {/* Header Zone (Breadcrumb) */}
        {headerZone && renderZone(headerZone, contextData)}

        {/* Main Content Container */}
        <div
          className={cn(
            'container-wide section-padding py-8 lg:py-12',
            maxWidth === 'narrow' && 'max-w-4xl',
            maxWidth === 'wide' && 'max-w-8xl'
          )}
        >
          {/* Hero Zone - Two Column Layout */}
          {heroZone && twoColumnHero && (
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12 lg:mb-16">
              {/* Left Column - Image Gallery (from Hero) */}
              {heroSectionConfig && (
                <div className="lg:sticky lg:top-8 lg:self-start">
                  {renderSection(
                    { ...heroSectionConfig, props: { ...heroSectionConfig.props, galleryOnly: true } },
                    contextData
                  )}
                </div>
              )}

              {/* Right Column - Product Info + CTAs */}
              <div className="space-y-6">
                {heroSectionConfig && (
                  renderSection(
                    { ...heroSectionConfig, props: { ...heroSectionConfig.props, infoOnly: true } },
                    contextData
                  )
                )}
                {heroOtherSections.map((config) =>
                  renderSection(config, contextData)
                )}
              </div>
            </div>
          )}

          {/* Hero Zone - Single Column Layout */}
          {heroZone && !twoColumnHero && (
            <div className="mb-12 lg:mb-16">
              {renderZone(heroZone, contextData)}
            </div>
          )}

          {/* Main Zone - Stacked Sections */}
          {mainZone && (
            <div className="space-y-12 lg:space-y-16">
              {mainZone.sections.map((config) => (
                <div key={config.id}>
                  {renderSection(config, contextData)}
                </div>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Overlay Zone (Sticky Bar) */}
      {overlayZone && renderZone(overlayZone, contextData)}
    </ProductPageProvider>
  )
}
