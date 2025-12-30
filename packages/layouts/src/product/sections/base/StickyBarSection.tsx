'use client'

/**
 * Sticky Bar Section
 *
 * Mobile sticky CTA bar that appears after scrolling.
 * Fixed at bottom on mobile/tablet only.
 *
 * Note: The StickyBuyBar component must be provided via context
 * since it's an app-specific component that can't be imported from packages.
 */

import { useProductPage } from '../../context'
import type { SectionProps } from '../../types'
import { AffiliateLink } from '@affiliate/ui/affiliate'
import { Button } from '@affiliate/ui/ui'

export default function StickyBarSection({ className }: SectionProps) {
  const { product, price, ctaText, primaryPartner, components } = useProductPage()

  if (!product.primaryAffiliateUrl) {
    return null
  }

  const StickyBuyBar = components?.StickyBuyBar

  // Use the provided StickyBuyBar component if available
  if (StickyBuyBar) {
    return (
      <StickyBuyBar
        productName={product.title}
        price={price.primary}
        affiliateUrl={product.primaryAffiliateUrl}
        ctaText={ctaText}
        partner={primaryPartner}
        className={className}
      />
    )
  }

  // Fallback: simple sticky bar implementation
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden ${className || ''}`}>
      <div className="flex items-center justify-between gap-4 bg-background/95 backdrop-blur-sm border-t border-border p-4 shadow-lg">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {product.title}
          </p>
          {price.primary && (
            <p className="text-lg font-bold text-foreground">{price.primary}</p>
          )}
        </div>
        <AffiliateLink href={product.primaryAffiliateUrl} partner={primaryPartner}>
          <Button
            size="lg"
            className="shrink-0"
            style={{ backgroundColor: 'var(--site-primary)', color: 'white' }}
          >
            {ctaText}
          </Button>
        </AffiliateLink>
      </div>
    </div>
  )
}
