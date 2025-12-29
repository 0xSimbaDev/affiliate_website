/**
 * Default Layout Configuration
 *
 * Provides the default product page layout used when a niche
 * doesn't have a custom layoutConfig.
 */

import type { NicheLayoutConfig } from './types'

/**
 * Default product page layout.
 * Matches the original product page structure.
 */
export const defaultLayoutConfig: NicheLayoutConfig = {
  options: {
    twoColumnHero: true,
    maxWidth: 'default',
  },
  zones: [
    {
      id: 'header',
      sections: [{ id: 'breadcrumb' }],
    },
    {
      id: 'hero',
      sections: [
        { id: 'hero' },
        { id: 'affiliate-partners' },
      ],
    },
    {
      id: 'main',
      sections: [
        { id: 'pros-cons' },
        { id: 'full-review' },
        { id: 'featured-articles' },
        { id: 'related-products' },
      ],
    },
    {
      id: 'overlay',
      sections: [{ id: 'sticky-bar' }],
    },
  ],
}

/**
 * Gaming niche layout configuration.
 * Adds specifications section for technical products.
 */
export const gamingLayoutConfig: NicheLayoutConfig = {
  options: {
    twoColumnHero: true,
    maxWidth: 'default',
  },
  zones: [
    {
      id: 'header',
      sections: [{ id: 'breadcrumb' }],
    },
    {
      id: 'hero',
      sections: [
        { id: 'hero' },
        { id: 'affiliate-partners' },
      ],
    },
    {
      id: 'main',
      sections: [
        { id: 'pros-cons' },
        {
          id: 'specifications',
          conditionField: 'specifications',
        },
        { id: 'full-review' },
        { id: 'featured-articles' },
        { id: 'related-products' },
      ],
    },
    {
      id: 'overlay',
      sections: [{ id: 'sticky-bar' }],
    },
  ],
}

/**
 * Beauty niche layout configuration.
 * Adds ingredients, how-to-use, and skin compatibility sections.
 */
export const beautyLayoutConfig: NicheLayoutConfig = {
  options: {
    twoColumnHero: true,
    maxWidth: 'default',
  },
  zones: [
    {
      id: 'header',
      sections: [{ id: 'breadcrumb' }],
    },
    {
      id: 'hero',
      sections: [
        { id: 'hero' },
        { id: 'affiliate-partners' },
        {
          id: 'skin-compatibility',
          conditionField: 'skinTypes',
        },
      ],
    },
    {
      id: 'main',
      sections: [
        { id: 'pros-cons' },
        {
          id: 'ingredients',
          conditionField: 'ingredients',
        },
        {
          id: 'how-to-use',
          conditionField: 'howToUse',
        },
        { id: 'full-review' },
        { id: 'featured-articles' },
        { id: 'related-products' },
      ],
    },
    {
      id: 'overlay',
      sections: [{ id: 'sticky-bar' }],
    },
  ],
}

/**
 * Get layout configuration for a niche.
 * Falls back to default if niche doesn't have a custom config.
 *
 * @param nicheLayoutConfig - Layout config from niche model (may be null)
 * @returns Resolved layout configuration
 */
export function resolveLayoutConfig(
  nicheLayoutConfig: NicheLayoutConfig | null | undefined
): NicheLayoutConfig {
  if (nicheLayoutConfig && nicheLayoutConfig.zones?.length > 0) {
    return nicheLayoutConfig
  }
  return defaultLayoutConfig
}
